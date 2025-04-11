interface CacheItem<T> {
  value: T;
  expiry: number;
}

class LocalCache {
  private cache: Map<string, CacheItem<any>>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest item when cache is full
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

export const useCache = () => {
  const cache = new LocalCache();

  const get = async <T>(key: string): Promise<T | null> => {
    try {
      return await cache.get<T>(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  };

  const set = async <T>(key: string, value: T, ttlSeconds: number): Promise<void> => {
    try {
      await cache.set(key, value, ttlSeconds);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  };

  const remove = async (key: string): Promise<void> => {
    try {
      await cache.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  };

  const clear = async (): Promise<void> => {
    try {
      await cache.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  };

  return {
    get,
    set,
    remove,
    clear
  };
};
