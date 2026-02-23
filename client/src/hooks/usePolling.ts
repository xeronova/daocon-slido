import { useEffect, useRef } from 'react';

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  interval: number,
  deps: any[] = []
) {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // 즉시 실행
    fetchFn();

    // interval마다 반복
    intervalRef.current = setInterval(fetchFn, interval);

    // cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, deps);
}
