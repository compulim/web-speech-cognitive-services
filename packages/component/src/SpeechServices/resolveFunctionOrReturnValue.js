export default async function resolveFunctionOrReturnValue(fnOrValue) {
  return await (typeof fnOrValue === 'function' ? fnOrValue() : fnOrValue);
}
