/**
 * Gestion d'erreurs + retry automatique pour ETL
 */

import { logger } from './logger.js';

interface RetryOptions {
  maxRetries?: number; // Default: 3
  delayMs?: number; // Default: 1000 (1s)
  backoffMultiplier?: number; // Default: 2 (exponential backoff)
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry automatique avec backoff exponentiel
 * 
 * @example
 * const data = await retry(
 *   async () => await fetchData(),
 *   { maxRetries: 3, delayMs: 1000 }
 * );
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        logger.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`, {
          error: lastError.message,
        });

        if (onRetry) {
          onRetry(attempt, lastError);
        }

        await sleep(delay);
      }
    }
  }

  logger.error(`All retry attempts failed (${maxRetries})`, {
    error: lastError!.message,
  });
  throw lastError!;
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wrapper d'erreur ETL avec contexte
 */
export class ETLError extends Error {
  constructor(
    message: string,
    public etlName: string,
    public phase: 'extract' | 'transform' | 'load',
    public context?: any
  ) {
    super(message);
    this.name = 'ETLError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      etlName: this.etlName,
      phase: this.phase,
      context: this.context,
    };
  }
}

/**
 * Détermine si une erreur est retryable
 */
export function isRetryableError(error: any): boolean {
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

