export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  tags: string[];
}

export interface CacheStats {
  totalKeys: number;
  totalMemoryUsage: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  totalHits: number;
  totalMisses: number;
}

export interface CacheConfig {
  maxMemoryMB: number;
  defaultTTL: number;
  maxKeys: number;
  evictionPolicy: 'LRU' | 'LFU' | 'TTL';
  compressionEnabled: boolean;
}

export class RedisLikeCache {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    totalKeys: 0,
    totalMemoryUsage: 0,
    hitRate: 0,
    missRate: 0,
    evictionCount: 0,
    totalHits: 0,
    totalMisses: 0
  };
  
  private config: CacheConfig = {
    maxMemoryMB: 50, // 50MB limit
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxKeys: 10000,
    evictionPolicy: 'LRU',
    compressionEnabled: true
  };

  private evictionTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // Start background cleanup
    this.startEvictionTimer();
    
    console.log('🚀 [CACHE] Redis-like cache initialized with config:', this.config);
  }

  // Core Redis-like operations
  set<T>(key: string, value: T, ttl?: number, tags: string[] = []): boolean {
    try {
      const now = Date.now();
      const entryTTL = ttl || this.config.defaultTTL;
      
      // Check if we need to evict before adding
      if (this.cache.size >= this.config.maxKeys) {
        this.evictLeastUsed();
      }
      
      // Compress data if enabled
      const processedValue = this.config.compressionEnabled 
        ? this.compressData(value)
        : value;
      
      const entry: CacheEntry<T> = {
        data: processedValue,
        timestamp: now,
        ttl: entryTTL,
        accessCount: 0,
        lastAccessed: now,
        tags
      };
      
      // Remove old entry if exists
      if (this.cache.has(key)) {
        this.cache.delete(key);
      }
      
      this.cache.set(key, entry);
      this.updateStats();
      
      console.log(`💾 [CACHE] SET ${key} (TTL: ${entryTTL}ms, Tags: [${tags.join(', ')}])`);
      return true;
    } catch (error) {
      console.error(`❌ [CACHE] SET failed for key ${key}:`, error);
      return false;
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.totalMisses++;
      this.updateHitRate();
      console.log(`❌ [CACHE] MISS ${key}`);
      return null;
    }
    
    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.totalMisses++;
      this.updateHitRate();
      console.log(`⏰ [CACHE] EXPIRED ${key}`);
      return null;
    }
    
    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    
    this.stats.totalHits++;
    this.updateHitRate();
    
    // Decompress data if needed
    const data = this.config.compressionEnabled 
      ? this.decompressData(entry.data)
      : entry.data;
    
    console.log(`✅ [CACHE] HIT ${key} (access count: ${entry.accessCount})`);
    return data;
  }

  del(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateStats();
      console.log(`🗑️ [CACHE] DEL ${key}`);
    }
    return deleted;
  }

  exists(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  expire(key: string, ttl: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    entry.ttl = ttl;
    entry.timestamp = Date.now(); // Reset timestamp
    console.log(`⏰ [CACHE] EXPIRE ${key} (TTL: ${ttl}ms)`);
    return true;
  }

  ttl(key: string): number {
    const entry = this.cache.get(key);
    if (!entry) return -2; // Key doesn't exist
    
    const now = Date.now();
    const remaining = entry.ttl - (now - entry.timestamp);
    
    if (remaining <= 0) {
      this.cache.delete(key);
      return -2;
    }
    
    return remaining;
  }

  // Advanced operations
  mget<T>(keys: string[]): (T | null)[] {
    return keys.map(key => this.get<T>(key));
  }

  mset<T>(keyValuePairs: Array<{ key: string; value: T; ttl?: number; tags?: string[] }>): boolean {
    try {
      keyValuePairs.forEach(({ key, value, ttl, tags }) => {
        this.set(key, value, ttl, tags);
      });
      return true;
    } catch (error) {
      console.error('❌ [CACHE] MSET failed:', error);
      return false;
    }
  }

  keys(pattern?: string): string[] {
    const allKeys = Array.from(this.cache.keys());
    
    if (!pattern) return allKeys;
    
    // Simple pattern matching (supports * wildcard)
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return allKeys.filter(key => regex.test(key));
  }

  // Tag-based operations
  getByTag(tag: string): Array<{ key: string; value: any }> {
    const results: Array<{ key: string; value: any }> = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        const value = this.get(key);
        if (value !== null) {
          results.push({ key, value });
        }
      }
    }
    
    return results;
  }

  invalidateByTag(tag: string): number {
    let deletedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    
    this.updateStats();
    console.log(`🏷️ [CACHE] Invalidated ${deletedCount} entries with tag: ${tag}`);
    return deletedCount;
  }

  // Memory management
  flushall(): void {
    const keyCount = this.cache.size;
    this.cache.clear();
    this.updateStats();
    console.log(`🧹 [CACHE] FLUSHALL - Cleared ${keyCount} keys`);
  }

  flushdb(): void {
    this.flushall();
  }

  // Statistics and monitoring
  info(): CacheStats & { config: CacheConfig } {
    return {
      ...this.stats,
      config: this.config
    };
  }

  getMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      totalSize += this.estimateSize(key) + this.estimateSize(entry);
    }
    
    return totalSize;
  }

  // Eviction policies
  private evictLeastUsed(): void {
    if (this.cache.size === 0) return;
    
    let keyToEvict: string | null = null;
    let criteria = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      let currentCriteria: number;
      
      switch (this.config.evictionPolicy) {
        case 'LRU':
          currentCriteria = entry.lastAccessed;
          if (currentCriteria < criteria) {
            criteria = currentCriteria;
            keyToEvict = key;
          }
          break;
          
        case 'LFU':
          currentCriteria = entry.accessCount;
          if (currentCriteria < criteria) {
            criteria = currentCriteria;
            keyToEvict = key;
          }
          break;
          
        case 'TTL':
          const remaining = entry.ttl - (Date.now() - entry.timestamp);
          if (remaining < criteria) {
            criteria = remaining;
            keyToEvict = key;
          }
          break;
      }
    }
    
    if (keyToEvict) {
      this.cache.delete(keyToEvict);
      this.stats.evictionCount++;
      console.log(`🚮 [CACHE] Evicted key: ${keyToEvict} (policy: ${this.config.evictionPolicy})`);
    }
  }

  private startEvictionTimer(): void {
    this.evictionTimer = setInterval(() => {
      this.cleanupExpired();
    }, 60000); // Run every minute
  }

  private cleanupExpired(): void {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      this.updateStats();
      console.log(`🧹 [CACHE] Cleaned up ${expiredCount} expired entries`);
    }
  }

  private updateStats(): void {
    this.stats.totalKeys = this.cache.size;
    this.stats.totalMemoryUsage = this.getMemoryUsage();
  }

  private updateHitRate(): void {
    const total = this.stats.totalHits + this.stats.totalMisses;
    this.stats.hitRate = total > 0 ? this.stats.totalHits / total : 0;
    this.stats.missRate = total > 0 ? this.stats.totalMisses / total : 0;
  }

  private compressData<T>(data: T): string {
    try {
      // Simple JSON compression (in a real Redis implementation, you'd use actual compression)
      return JSON.stringify(data);
    } catch (error) {
      console.warn('⚠️ [CACHE] Compression failed, storing raw data');
      return data as any;
    }
  }

  private decompressData<T>(data: any): T {
    try {
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
      return data;
    } catch (error) {
      console.warn('⚠️ [CACHE] Decompression failed, returning raw data');
      return data;
    }
  }

  private estimateSize(obj: any): number {
    const str = JSON.stringify(obj);
    return new Blob([str]).size;
  }

  // Cleanup
  destroy(): void {
    if (this.evictionTimer) {
      clearInterval(this.evictionTimer);
      this.evictionTimer = null;
    }
    this.flushall();
    console.log('🔥 [CACHE] Cache destroyed');
  }
}

// Singleton instance
export const redisCache = new RedisLikeCache({
  maxMemoryMB: 100,
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  maxKeys: 5000,
  evictionPolicy: 'LRU',
  compressionEnabled: true
});

// Cache key generators for different data types
export const CacheKeys = {
  userOrders: (userId: string, filters?: any) => {
    const filterStr = filters ? JSON.stringify(filters) : 'all';
    return `orders:user:${userId}:${filterStr}`;
  },
  
  orderDetails: (orderId: string) => `order:${orderId}`,
  
  userProfile: (userId: string) => `profile:${userId}`,
  
  adminStats: () => 'admin:stats',
  
  adminOrders: (filters?: any) => {
    const filterStr = filters ? JSON.stringify(filters) : 'all';
    return `admin:orders:${filterStr}`;
  },
  
  adminUsers: (filters?: any) => {
    const filterStr = filters ? JSON.stringify(filters) : 'all';
    return `admin:users:${filterStr}`;
  }
};

// Cache tags for invalidation
export const CacheTags = {
  ORDERS: 'orders',
  USERS: 'users',
  PROFILES: 'profiles',
  ADMIN: 'admin',
  STATS: 'stats'
};