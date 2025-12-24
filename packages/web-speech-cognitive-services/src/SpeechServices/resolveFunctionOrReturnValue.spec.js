/// <reference types="jest" />

import resolveFunctionOrReturnValue from './resolveFunctionOrReturnValue';

test('resolve sync function', () => {
  expect(resolveFunctionOrReturnValue(() => 1)).toBe(1);
});

test('resolve async function', async () => {
  await expect(resolveFunctionOrReturnValue(() => Promise.resolve(1))).resolves.toBe(1);
});

test('return sync value', () => {
  expect(resolveFunctionOrReturnValue(1)).toBe(1);
});

test('return async value', async () => {
  await expect(resolveFunctionOrReturnValue(Promise.resolve(1))).resolves.toBe(1);
});
