import { ChatMessage } from '@/types';
import { logger } from './logger';

interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  tags: string[];
  provider?: string;
  model?: string;
  tokenCount?: number;
}

interface CacheOptions {
  ttl?: number;
  tags?: string[];
  provider?: string;
  model?: string;
}

/**
 * AI Response Caching Service
 * Supports multiple storage backends and intelligent cache invalidation
 */
class AICacheService {
  private memoryCache = new Map<string, CacheEntry>();
  private maxMemoryEntries = 1000;
  private defaultTTL = 1000 * 60 * 60; // 1 hour
  
  constructor() {
    // Clean expired entries periodically
    setInterval(() => this.cleanExpired(), 1000 * 60 * 5); // Every 5 minutes
  }

  /**
   * Generate cache key from request parameters
   */
  private generateKey(prefix: string, params: any): string {
    const normalized = this.normalizeParams(params);
    const hash = this.simpleHash(JSON.stringify(normalized));
    return `${prefix}:${hash}`;
  }

  /**
   * Normalize parameters for consistent caching
   */
  private normalizeParams(params: any): any {
    if (Array.isArray(params)) {
      return params.map(this.normalizeParams.bind(this));
    }
    
    if (params && typeof params === 'object') {
      const normalized: any = {};
      const sortedKeys = Object.keys(params).sort();
      
      for (const key of sortedKeys) {
        // Skip non-deterministic fields
        if (['timestamp', 'requestId', 'sessionId'].includes(key)) {
          continue;
        }
        normalized[key] = this.normalizeParams(params[key]);
      }
      
      return normalized;
    }
    
    return params;
  }

  /**
   * Simple hash function for cache keys
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached response
   */
  async get(key: string): Promise<any | null> {
    try {
      // Check memory cache first
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry && !this.isExpired(memoryEntry)) {
        logger.info('ai_provider', 'cache_hit', {
          cacheType: 'memory',
          key: key.substring(0, 20),
          provider: memoryEntry.provider,
          model: memoryEntry.model
        });
        return memoryEntry.value;
      }

      // Check persistent cache (Redis/Database) if available
      const persistentValue = await this.getFromPersistentCache(key);
      if (persistentValue) {
        // Store in memory for faster access
        this.memoryCache.set(key, persistentValue);
        logger.info('ai_provider', 'cache_hit', {
          cacheType: 'persistent',
          key: key.substring(0, 20)
        });
        return persistentValue.value;
      }

      logger.info('ai_provider', 'cache_miss', { key: key.substring(0, 20) });
      return null;
    } catch (error) {
      logger.error('ai_provider', 'cache_error', {
        operation: 'get',
        error: (error as Error).message
      });
      return null;
    }
  }

  /**
   * Store response in cache
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || this.defaultTTL;
      const entry: CacheEntry = {
        key,
        value,
        timestamp: Date.now(),
        ttl,
        tags: options.tags || [],
        provider: options.provider,
        model: options.model
      };

      // Store in memory cache
      this.memoryCache.set(key, entry);
      
      // Limit memory cache size
      if (this.memoryCache.size > this.maxMemoryEntries) {
        this.evictOldest();
      }

      // Store in persistent cache if available
      await this.setInPersistentCache(key, entry);

      logger.info('ai_provider', 'cache_set', {
        key: key.substring(0, 20),
        ttl,
        provider: options.provider,
        model: options.model
      });
    } catch (error) {
      logger.error('ai_provider', 'cache_error', {
        operation: 'set',
        error: (error as Error).message
      });
    }
  }

  /**
   * Cache Marcus LLM responses
   */
  async cacheMarcusResponse(messages: ChatMessage[], context: any, response: string, provider: string): Promise<void> {
    const key = this.generateKey('marcus', { messages, context });
    await this.set(key, response, {
      ttl: 1000 * 60 * 30, // 30 minutes
      tags: ['marcus', 'llm'],
      provider,
      model: 'marcus'
    });
  }

  /**
   * Get cached Marcus response
   */
  async getCachedMarcusResponse(messages: ChatMessage[], context: any): Promise<string | null> {
    const key = this.generateKey('marcus', { messages, context });
    return await this.get(key);
  }

  /**
   * Cache image generation responses
   */
  async cacheImageResponse(prompt: string, parameters: any, response: any, provider: string): Promise<void> {
    const key = this.generateKey('image', { prompt, parameters });
    await this.set(key, response, {
      ttl: 1000 * 60 * 60 * 24, // 24 hours (images are expensive)
      tags: ['image', 'generation'],
      provider,
      model: parameters.model || 'unknown'
    });
  }

  /**
   * Get cached image response
   */
  async getCachedImageResponse(prompt: string, parameters: any): Promise<any | null> {
    const key = this.generateKey('image', { prompt, parameters });
    return await this.get(key);
  }

  /**
   * Cache storyboard responses
   */
  async cacheStoryboardResponse(request: any, response: any): Promise<void> {
    const key = this.generateKey('storyboard', request);
    await this.set(key, response, {
      ttl: 1000 * 60 * 60 * 2, // 2 hours
      tags: ['storyboard', 'marcus'],
      provider: 'marcus',
      model: 'storyboard'
    });
  }

  /**
   * Get cached storyboard response
   */
  async getCachedStoryboardResponse(request: any): Promise<any | null> {
    const key = this.generateKey('storyboard', request);
    return await this.get(key);
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.memoryCache.delete(key));
    
    logger.info('ai_provider', 'cache_invalidated', {
      tags,
      count: keysToDelete.length
    });
  }

  /**
   * Clear all cached responses for a provider
   */
  async clearProvider(provider: string): Promise<void> {
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.provider === provider) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.memoryCache.delete(key));
    
    logger.info('ai_provider', 'cache_cleared', { provider, count: keysToDelete.length });
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Clean expired entries from memory cache
   */
  private cleanExpired(): void {
    let cleanedCount = 0;
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info('ai_provider', 'cache_cleaned', { cleanedCount });
    }
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTimestamp = Date.now();
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  /**
   * Get from persistent cache (Redis/Database)
   */
  private async getFromPersistentCache(key: string): Promise<CacheEntry | null> {
    // TODO: Implement Redis or Database cache
    // For now, return null (memory cache only)
    return null;
  }

  /**
   * Set in persistent cache (Redis/Database)
   */
  private async setInPersistentCache(key: string, entry: CacheEntry): Promise<void> {
    // TODO: Implement Redis or Database cache
    // For now, do nothing (memory cache only)
  }

  /**
   * Get cache statistics
   */
  getStats(): any {
    const stats = {
      memoryEntries: this.memoryCache.size,
      maxMemoryEntries: this.maxMemoryEntries,
      providers: new Set<string>(),
      tags: new Set<string>()
    };

    for (const entry of this.memoryCache.values()) {
      if (entry.provider) stats.providers.add(entry.provider);
      entry.tags.forEach(tag => stats.tags.add(tag));
    }

    return {
      ...stats,
      providers: Array.from(stats.providers),
      tags: Array.from(stats.tags)
    };
  }

  /**
   * Warm cache with common responses
   */
  async warmCache(): Promise<void> {
    logger.info('ai_provider', 'cache_warming_started');
    
    // Pre-cache common Marcus responses
    const commonQueries = [
      'Hello, I need help creating an ad',
      'Tell me about your brand',
      'What industry are you in?'
    ];

    // In a real implementation, you might pre-generate these
    logger.info('ai_provider', 'cache_warming_completed');
  }
}

// Export singleton instance
export const aiCache = new AICacheService();

// Helper functions for easy integration
export const withCache = {
  marcus: async (messages: ChatMessage[], context: any, operation: () => Promise<string>): Promise<string> => {
    // Check cache first
    const cached = await aiCache.getCachedMarcusResponse(messages, context);
    if (cached) {
      return cached;
    }

    // Execute operation and cache result
    const result = await operation();
    await aiCache.cacheMarcusResponse(messages, context, result, 'marcus');
    return result;
  },

  image: async (prompt: string, parameters: any, operation: () => Promise<any>): Promise<any> => {
    const cached = await aiCache.getCachedImageResponse(prompt, parameters);
    if (cached) {
      return cached;
    }

    const result = await operation();
    await aiCache.cacheImageResponse(prompt, parameters, result, parameters.provider || 'unknown');
    return result;
  },

  storyboard: async (request: any, operation: () => Promise<any>): Promise<any> => {
    const cached = await aiCache.getCachedStoryboardResponse(request);
    if (cached) {
      return cached;
    }

    const result = await operation();
    await aiCache.cacheStoryboardResponse(request, result);
    return result;
  }
};
