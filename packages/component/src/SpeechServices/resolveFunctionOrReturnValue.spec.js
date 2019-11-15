import resolveFunctionOrReturnValue from './resolveFunctionOrReturnValue';

test('resolve sync function', async () => {
  await expect(resolveFunctionOrReturnValue(() => 1)).resolves.toBe(1);
});

test('resolve async function', async () => {
  await expect(resolveFunctionOrReturnValue(() => Promise.resolve(1))).resolves.toBe(1);
});

test('return sync value', async () => {
  await expect(resolveFunctionOrReturnValue(1)).resolves.toBe(1);
});

test('return async value', async () => {
  await expect(resolveFunctionOrReturnValue(Promise.resolve(1))).resolves.toBe(1);
});
