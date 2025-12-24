import { useEffect } from 'react';

export default function useInterval(fn, interval, deps = []) {
  useEffect(() => {
    const timer = setInterval(fn, interval);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, interval, ...deps]);
}
