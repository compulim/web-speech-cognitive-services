import memoize from 'memoize-one';

export default (resultFn, equalityFn, disposeFn) => {
  let initialized;
  let instance;

  return memoize((...args) => {
    initialized && disposeFn(instance);
    initialized = true;

    return resultFn(...args);
  }, equalityFn);
}
