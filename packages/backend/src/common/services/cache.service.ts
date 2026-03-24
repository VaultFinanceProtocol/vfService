import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly redis: Redis;
  private readonly defaultTTL: number;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const db = this.configService.get<number>('REDIS_DB', 0);

    this.redis = new Redis({
      host,
      port,
      password,
      db,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.defaultTTL = this.configService.get<number>('CACHE_TTL', 300); // 5 minutes

    this.redis.on('connect', () => {
      this.logger.log('Redis connected');
    });

    this.redis.on('error', (err) => {
      this.logger.error('Redis error:', err);
    });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const expiry = ttl || this.defaultTTL;
      await this.redis.setex(key, expiry, serialized);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete values by pattern
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }

  /**
   * Get or set cache value
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Increment value
   */
  async increment(key: string, amount = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, amount);
    } catch (error) {
      this.logger.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Decrement value
   */
  async decrement(key: string, amount = 1): Promise<number> {
    try {
      return await this.redis.decrby(key, amount);
    } catch (error) {
      this.logger.error(`Cache decrement error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Set hash field
   */
  async hSet(key: string, field: string, value: unknown): Promise<void> {
    try {
      await this.redis.hset(key, field, JSON.stringify(value));
    } catch (error) {
      this.logger.error(`Cache hSet error for key ${key}:${field}:`, error);
    }
  }

  /**
   * Get hash field
   */
  async hGet<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redis.hget(key, field);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      this.logger.error(`Cache hGet error for key ${key}:${field}:`, error);
      return null;
    }
  }

  /**
   * Get all hash fields
   */
  async hGetAll<T>(key: string): Promise<Record<string, T> | null> {
    try {
      const values = await this.redis.hgetall(key);
      if (values) {
        const result: Record<string, T> = {};
        for (const [field, value] of Object.entries(values)) {
          result[field] = JSON.parse(value);
        }
        return result;
      }
      return null;
    } catch (error) {
      this.logger.error(`Cache hGetAll error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL of a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.error(`Cache ttl error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Flush all cache
   */
  async flushAll(): Promise<void> {
    try {
      await this.redis.flushdb();
      this.logger.warn('Cache flushed');
    } catch (error) {
      this.logger.error('Cache flush error:', error);
    }
  }

  /**
   * Get Redis client for advanced operations
   */
  getClient(): Redis {
    return this.redis;
  }

  /**
   * Generate cache key with prefix
   */
  generateKey(...parts: string[]): string {
    return `vfservice:${parts.join(':')}`;
  }
}
