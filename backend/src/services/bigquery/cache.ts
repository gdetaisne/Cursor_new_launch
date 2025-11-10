/**
 * Cache in-memory simple pour les queries BigQuery
 * 
 * Stratégie :
 * - TTL par défaut : 5 minutes (données analytics changent peu)
 * - Clé de cache : hash(query + params)
 * - Éviction automatique après TTL
 * - Max 1000 entrées (LRU)
 * 
 * Production : remplacer par Redis si nécessaire
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // en ms
}

export class BigQueryCache {
  private cache: Map<string, CacheEntry<any>>;
  private maxEntries: number;
  private defaultTTL: number;

  constructor(maxEntries = 1000, defaultTTL = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Génère une clé de cache depuis les paramètres
   */
  private generateKey(queryName: string, params: any): string {
    const paramsStr = JSON.stringify(params, Object.keys(params).sort());
    return `${queryName}:${paramsStr}`;
  }

  /**
   * Récupère une entrée du cache si valide
   */
  get<T>(queryName: string, params: any): T | null {
    const key = this.generateKey(queryName, params);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Stocke une entrée dans le cache
   */
  set<T>(queryName: string, params: any, data: T, ttl?: number): void {
    // Éviction LRU si limite atteinte
    if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const key = this.generateKey(queryName, params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    });
  }

  /**
   * Invalide une entrée spécifique
   */
  invalidate(queryName: string, params: any): void {
    const key = this.generateKey(queryName, params);
    this.cache.delete(key);
  }

  /**
   * Invalide toutes les entrées d'une query
   */
  invalidateQuery(queryName: string): void {
    const prefix = `${queryName}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Vide complètement le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Statistiques du cache
   */
  getStats(): {
    size: number;
    maxEntries: number;
    defaultTTL: number;
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      defaultTTL: this.defaultTTL,
    };
  }
}

// Singleton global
export const bigQueryCache = new BigQueryCache();

