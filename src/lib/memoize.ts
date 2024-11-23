// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const memoize = <T extends (...args: any[]) => any>(
  fn: T,
  getKey: (...args: Parameters<T>) => string
): T => {
  const cache: Map<string, ReturnType<T>> = new Map();

  return ((...args: Parameters<T>) => {
    const cacheKey = getKey(...args);

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const result = fn(...args);

    cache.set(cacheKey, result);

    return result;
  }) as T;
};
