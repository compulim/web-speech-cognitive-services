import createDeferred from 'p-defer';

export default function waitForEvent(target, name) {
  const handleError = ({ error }) =>
    reject(error instanceof Error ? error : new Error(error.stack || error.message || error));
  const { promise, reject, resolve } = createDeferred();

  target.addEventListener(name, resolve);
  target.addEventListener('error', handleError);

  return promise.finally(() => {
    target.removeEventListener(name, resolve);
    target.removeEventListener('error', handleError);
  });
}
