/**
 * SERVICE DE CACHE MÉMOIRE HAUTE PERFORMANCE & RÉSILIENCE FORTE CHARGE
 * 
 * - Singleflight Pattern : Protège la base de données contre les vagues d'accès simultanées
 * - Zéro dépendance externe
 * - Invalidation sélective par préfixe lors des modifications admin
 * - Élimination automatique des entrées expirées (anti-fuite mémoire)
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Nettoyage régulier toutes les 60 secondes des entrées expirées
    this.cleanupInterval = setInterval(() => this.pruneExpired(), 60_000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds = 300): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  del(key: string): void {
    this.cache.delete(key);
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  /**
   * Pattern Singleflight (Coalescing de requêtes) :
   * Si 100 clients scannent le QR code à la même milliseconde lors d'un cache-miss,
   * UNE SEULE requête SQL part à la base de données TiDB, et les 99 autres attendent
   * la résolution de la même promesse en mémoire.
   */
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 300): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    if (this.inFlight.has(key)) {
      return (await this.inFlight.get(key)) as T;
    }

    const promise = (async () => {
      try {
        const fresh = await fetcher();
        this.set(key, fresh, ttlSeconds);
        return fresh;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return await promise;
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const cacheService = new MemoryCacheService();
