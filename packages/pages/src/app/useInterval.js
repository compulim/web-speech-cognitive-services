import { useEffect } from 'react';

export default function useInterval(fn, interval, deps = []) {
  useEffect(() => {
    const timer = setInterval(fn, interval);

    return () => clearInterval(timer);
  }, [fn, interval, ...deps]);
}
