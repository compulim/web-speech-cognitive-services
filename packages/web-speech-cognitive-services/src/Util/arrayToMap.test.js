import arrayToMap from './arrayToMap';

test('convert an array with no items', () => {
  const actual = arrayToMap([], { abc: 1 });

  expect(actual).toHaveProperty('length', 0);
  expect(actual).toHaveProperty('abc', 1);
});

test('convert function', () => {
  expect(() => arrayToMap(null, { abc: 1 })).toThrow();
});

test('convert boolean', () => {
  expect(() => arrayToMap(null, { abc: 1 })).toThrow();
});

test('convert number', () => {
  expect(() => arrayToMap(null, { abc: 1 })).toThrow();
});

test('convert string', () => {
  expect(() => arrayToMap(null, { abc: 1 })).toThrow();
});

test('convert null', () => {
  expect(() => arrayToMap(null, { abc: 1 })).toThrow();
});

test('convert undefined', () => {
  expect(() => arrayToMap(undefined, { abc: 1 })).toThrow();
});

test('convert an array with a single item', () => {
  const actual = arrayToMap(['one'], { abc: 1 });

  expect(actual[0]).toBe('one');
  expect(actual).toHaveProperty('length', 1);
  expect(actual).toHaveProperty('abc', 1);

  const [one] = actual;

  expect(one).toBe('one');
});

test('convert an array with three items', () => {
  const actual = arrayToMap(['one', 'two', 'three'], { abc: 1 });

  expect(actual[0]).toBe('one');
  expect(actual[1]).toBe('two');
  expect(actual[2]).toBe('three');
  expect(actual).toHaveProperty('length', 3);
  expect(actual).toHaveProperty('abc', 1);

  const [one, two, three] = actual;

  expect(one).toBe('one');
  expect(two).toBe('two');
  expect(three).toBe('three');
});
