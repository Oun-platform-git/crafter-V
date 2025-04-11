import Redis from 'ioredis';
import { config } from '../config';

export class Cache {
  private redis: Redis;
  private localCache: Map<string, { value: any; expiry: number }>;
  private readonly useRedis: boolean;

  constructor() {
    this.useRedis = config.redis.enabled;
    
    if (this.useRedis) {
      this.redis = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        }
      });

      this.redis.on('error', (error) => {
        console.error('Redis connection error:', error);
        this.useRedis = false;
      });
    }

    this.localCache = new Map();
  }

  async get(key: string): Promise<any> {
    try {
      if (this.useRedis) {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        const cached = this.localCache.get(key);
        if (!cached) return null;
        
        if (Date.now() > cached.expiry) {
          this.localCache.delete(key);
          return null;
        }
        
        return cached.value;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number): Promise<void> {
    try {
      if (this.useRedis) {
        await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      } else {
        this.localCache.set(key, {
          value,
          expiry: Date.now() + (ttlSeconds * 1000)
        });
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (this.useRedis) {
        await this.redis.del(key);
      } else {
        this.localCache.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async flush(): Promise<void> {
    try {
      if (this.useRedis) {
        await this.redis.flushall();
      } else {
        this.localCache.clear();
      }
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }

  async getMulti(keys: string[]): Promise<any[]> {
    try {
      if (this.useRedis) {
        const values = await this.redis.mget(keys);
        return values.map(v => v ? JSON.parse(v) : null);
      } else {
        return keys.map(key => {
          const cached = this.localCache.get(key);
          if (!cached || Date.now() > cached.expiry) return null;
          return cached.value;
        });
      }
    } catch (error) {
      console.error('Cache getMulti error:', error);
      return keys.map(() => null);
    }
  }

  async setMulti(items: { key: string; value: any; ttl: number }[]): Promise<void> {
    try {
      if (this.useRedis) {
        const pipeline = this.redis.pipeline();
        items.forEach(item => {
          pipeline.set(item.key, JSON.stringify(item.value), 'EX', item.ttl);
        });
        await pipeline.exec();
      } else {
        items.forEach(item => {
          this.localCache.set(item.key, {
            value: item.value,
            expiry: Date.now() + (item.ttl * 1000)
          });
        });
      }
    } catch (error) {
      console.error('Cache setMulti error:', error);
    }
  }

  async increment(key: string, value: number = 1): Promise<number> {
    try {
      if (this.useRedis) {
        return await this.redis.incrby(key, value);
      } else {
        const cached = this.localCache.get(key);
        const currentValue = cached ? cached.value : 0;
        const newValue = currentValue + value;
        this.localCache.set(key, {
          value: newValue,
          expiry: cached ? cached.expiry : Date.now() + (86400 * 1000) // Default 24h TTL
        });
        return newValue;
      }
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  async getTTL(key: string): Promise<number> {
    try {
      if (this.useRedis) {
        return await this.redis.ttl(key);
      } else {
        const cached = this.localCache.get(key);
        if (!cached) return -2;
        const ttl = Math.floor((cached.expiry - Date.now()) / 1000);
        return ttl > 0 ? ttl : -1;
      }
    } catch (error) {
      console.error('Cache getTTL error:', error);
      return -2;
    }
  }
}
