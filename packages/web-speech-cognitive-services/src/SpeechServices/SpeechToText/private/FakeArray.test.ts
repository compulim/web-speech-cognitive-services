import { expect } from 'expect';
import { test } from 'node:test';
import FakeArray from './FakeArray.ts';

test('should return indexed item', () => {
  expect(new FakeArray([1, 2, 3])).toHaveProperty(['1'], 2);
});

test('should return indexed item via Reflect.get', () => {
  expect(Reflect.get(new FakeArray([1, 2, 3]), 1)).toBe(2);
});

test('should return length', () => {
  expect(new FakeArray([1, 2, 3])).toHaveProperty('length', 3);
});
