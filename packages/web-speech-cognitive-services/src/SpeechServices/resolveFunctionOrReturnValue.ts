function isFunction(value: unknown): value is () => unknown {
  return typeof value === 'function';
}

export default function resolveFunctionOrReturnValue<T>(
  fnOrValue: (() => Promise<T> | T) | Promise<T> | T
): Promise<T> | T {
  return isFunction(fnOrValue) ? fnOrValue() : fnOrValue;
}
