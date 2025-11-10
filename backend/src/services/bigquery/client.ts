/**
 * Client BigQuery singleton pour le service Analytics
 * 
 * Fonctionnalités :
 * - Initialisation lazy avec retry
 * - Gestion d'erreurs robuste
 * - Cache automatique des queries
 * - Timeout configurable
 * - Logs structurés
 */

import { BigQuery } from '@google-cloud/bigquery';
import type { BigQueryConfig, BigQueryServiceError } from './types.js';
import { bigQueryCache } from './cache.js';

class BigQueryClient {
  private client: BigQuery | null = null;
  private config: BigQueryConfig | null = null;
  private isInitialized = false;

  /**
   * Initialise le client BigQuery avec les credentials
   */
  initialize(config: BigQueryConfig): void {
    if (this.isInitialized) {
      console.warn('[BigQuery] Client already initialized');
      return;
    }

    try {
      this.config = {
        maxRetries: 3,
        timeoutMs: 30000,
        ...config,
      };

      this.client = new BigQuery({
        projectId: config.projectId,
        credentials: config.credentials,
      });

      this.isInitialized = true;
      console.log(`[BigQuery] Initialized for project: ${config.projectId}`);
    } catch (error) {
      console.error('[BigQuery] Initialization failed:', error);
      throw this.createError('INIT_FAILED', 'Failed to initialize BigQuery client', error);
    }
  }

  /**
   * Exécute une query BigQuery avec cache et retry
   */
  async query<T>(
    queryName: string,
    sql: string,
    params: any = {},
    options: {
      useCache?: boolean;
      cacheTTL?: number;
      timeout?: number;
    } = {}
  ): Promise<{ data: T[]; cached: boolean; duration: number }> {
    if (!this.isInitialized || !this.client || !this.config) {
      throw this.createError('NOT_INITIALIZED', 'BigQuery client not initialized');
    }

    const useCache = options.useCache ?? true;
    const startTime = Date.now();

    // 1. Vérifier le cache
    if (useCache) {
      const cached = bigQueryCache.get<T[]>(queryName, params);
      if (cached) {
        const duration = Date.now() - startTime;
        console.log(`[BigQuery] Cache HIT for ${queryName} (${duration}ms)`);
        return { data: cached, cached: true, duration };
      }
    }

    // 2. Exécuter la query avec retry
    try {
      const timeout = options.timeout ?? this.config.timeoutMs!;
      const [rows] = await this.executeWithRetry<T>(sql, timeout);

      const duration = Date.now() - startTime;
      console.log(`[BigQuery] Query ${queryName} completed (${duration}ms, ${rows.length} rows)`);

      // 3. Mettre en cache
      if (useCache) {
        bigQueryCache.set(queryName, params, rows, options.cacheTTL);
      }

      return { data: rows, cached: false, duration };
    } catch (error) {
      console.error(`[BigQuery] Query ${queryName} failed:`, error);
      throw this.createError('QUERY_FAILED', `Query ${queryName} failed`, error);
    }
  }

  /**
   * Exécute une query avec retry automatique
   */
  private async executeWithRetry<T>(
    sql: string,
    timeout: number,
    attempt = 1
  ): Promise<T[][]> {
    if (!this.client || !this.config) {
      throw new Error('Client not initialized');
    }

    try {
      const options = {
        query: sql,
        timeoutMs: timeout,
        useLegacySql: false,
      };

      return await this.client.query(options);
    } catch (error: any) {
      const shouldRetry = this.isRetryableError(error) && attempt < this.config.maxRetries!;

      if (shouldRetry) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Backoff exponentiel
        console.warn(`[BigQuery] Retry attempt ${attempt} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry<T>(sql, timeout, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Détermine si une erreur est retryable
   */
  private isRetryableError(error: any): boolean {
    if (!error) return false;

    const retryableCodes = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      500, // Internal Server Error
      503, // Service Unavailable
      429, // Too Many Requests
    ];

    return (
      retryableCodes.includes(error.code) ||
      retryableCodes.includes(error.statusCode) ||
      error.message?.includes('timeout') ||
      error.message?.includes('ECONNRESET')
    );
  }

  /**
   * Crée une erreur typée BigQueryServiceError
   */
  private createError(
    code: string,
    message: string,
    details?: any
  ): BigQueryServiceError {
    const error = new Error(message) as any;
    error.name = 'BigQueryServiceError';
    error.code = code;
    error.details = details;
    return error;
  }

  /**
   * Vérifie si le client est initialisé
   */
  isReady(): boolean {
    return this.isInitialized && this.client !== null;
  }

  /**
   * Retourne la config actuelle (sans credentials)
   */
  getConfig(): Omit<BigQueryConfig, 'credentials'> | null {
    if (!this.config) return null;
    const { credentials, ...safeConfig } = this.config;
    return safeConfig;
  }

  /**
   * Vide le cache
   */
  clearCache(): void {
    bigQueryCache.clear();
    console.log('[BigQuery] Cache cleared');
  }
}

// Singleton global
export const bigQueryClient = new BigQueryClient();

