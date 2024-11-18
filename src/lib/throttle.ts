// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => ReturnType<T>) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args) => {
    if (!timeout) {
      const result = func(...args);

      timeout = setTimeout(() => {
        timeout = null;
      }, delay);

      return result;
    }
  };
};
