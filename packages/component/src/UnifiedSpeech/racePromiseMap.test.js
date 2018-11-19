import racePromiseMap from './racePromiseMap';

test('should resolve as first of two resolving promises', async () => {
  const result = await racePromiseMap({
    first: Promise.resolve(1),
    second: Promise.resolve(2)
  });

  expect(result).toEqual({ first: 1 });
});

test('should resolve as first resolving promise', async () => {
  const result = await racePromiseMap({
    first: new Promise(() => {}),
    second: Promise.resolve(2)
  });

  expect(result).toEqual({ second: 2 });
});

test('should reject as first rejecting promise', async () => {
  const task = racePromiseMap({
    first: new Promise(() => {}),
    second: Promise.reject(2)
  });

  await expect(task).rejects.toBe(2);
});
