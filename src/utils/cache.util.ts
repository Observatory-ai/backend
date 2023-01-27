import { Cache } from 'cache-manager';

export class CacheUtil {
  /**
   * Creates a cache key from the given arguments
   * @param args the arguments to create the key from
   * @returns the cache key
   */
  static createCacheKey(...args: string[]): string {
    return args.join('_');
  }

  /**
   * Gets the value from the cache or executes the callback and sets the value in the cache
   * @param cacheKey the cache key
   * @param cache the cache
   * @param callback the callback to execute if the value is not in the cache
   * @param ttl the time to live in seconds
   * @returns the value
   */
  static withCache<T>(
    cacheKey: string,
    cache: Cache,
    callback: () => Promise<T>,
    ttl: number,
  ): Promise<T> {
    console.log('cache obejct::::::::::::::::', cache);
    return cache.get<T>(cacheKey).then((value: T) => {
      if (value) {
        return value;
      } else {
        return callback().then((result: T) => {
          cache.set(cacheKey, result, ttl);
          return result;
        });
      }
    });
  }
}
