import patchOptions from './patchOptions';

let originalConsole;
let logging = {};

beforeEach(() => {
  originalConsole = console;
  console = {};

  ['error', 'info', 'warn', 'log'].forEach(type => {
    console[type] = (...args) => (logging[type] || (logging[type] = [])).push(args);
  });
});

afterEach(() => {
  console = originalConsole;
});

test('authorizationToken as string', async () => {
  const options = patchOptions({ authorizationToken: 'a1b2c3d', region: 'westus2' });
  const actual = options.fetchCredentials();

  await expect(actual).resolves.toEqual({ authorizationToken: 'a1b2c3d', region: 'westus2' });
});

test('authorizationToken as Promise<string>', async () => {
  const options = patchOptions({ authorizationToken: Promise.resolve('a1b2c3d'), region: 'westus2' });
  const actual = options.fetchCredentials();

  await expect(actual).resolves.toEqual({ authorizationToken: 'a1b2c3d', region: 'westus2' });
});

test('authorizationToken as () => string', async () => {
  const options = patchOptions({ authorizationToken: () => 'a1b2c3d', region: 'westus2' });
  const actual = options.fetchCredentials();

  await expect(actual).resolves.toEqual({ authorizationToken: 'a1b2c3d', region: 'westus2' });
});

test('authorizationToken as () => Promise<string>', async () => {
  const options = patchOptions({ authorizationToken: () => Promise.resolve('a1b2c3d'), region: 'westus2' });
  const actual = options.fetchCredentials();

  await expect(actual).resolves.toEqual({ authorizationToken: 'a1b2c3d', region: 'westus2' });
});

test('region should default to "westus"', async () => {
  const options = patchOptions({ authorizationToken: 'a1b2c3d' });
  const actual = options.fetchCredentials();

  await expect(actual).resolves.toEqual({ authorizationToken: 'a1b2c3d', region: 'westus' });
});

test('subscriptionKey as string', async () => {
  const options = patchOptions({ region: 'westus2', subscriptionKey: 'a1b2c3d' });
  const actual = options.fetchCredentials();

  await expect(actual).resolves.toEqual({ region: 'westus2', subscriptionKey: 'a1b2c3d' });
});

test('subscriptionKey as Promise<string>', async () => {
  const options = patchOptions({ region: 'westus2', subscriptionKey: Promise.resolve('a1b2c3d') });
  const actual = options.fetchCredentials();

  await expect(actual).resolves.toEqual({ region: 'westus2', subscriptionKey: 'a1b2c3d' });
});

test('subscriptionKey as () => string', async () => {
  const options = patchOptions({ region: 'westus2', subscriptionKey: () => 'a1b2c3d' });
  const actual = options.fetchCredentials();

  await expect(actual).resolves.toEqual({ region: 'westus2', subscriptionKey: 'a1b2c3d' });
});

test('subscriptionKey as () => Promise<string>', async () => {
  const options = patchOptions({ region: 'westus2', subscriptionKey: () => Promise.resolve('a1b2c3d') });
  const actual = options.fetchCredentials();

  await expect(actual).resolves.toEqual({ region: 'westus2', subscriptionKey: 'a1b2c3d' });
});

test('should throw exception for authorizationKey as number', async () => {
  const options = patchOptions({ authorizationToken: 123, region: 'westus2' });
  const actual = options.fetchCredentials();

  await expect(actual).rejects.toThrow();
});

test('should throw exception for authorizationKey as Promise<number>', async () => {
  const options = patchOptions({ authorizationToken: Promise.resolve(123), region: 'westus2' });
  const actual = options.fetchCredentials();

  await expect(actual).rejects.toThrow();
});

test('should throw exception for authorizationKey as () => number', async () => {
  const options = patchOptions({ authorizationToken: () => 123, region: 'westus2' });
  const actual = options.fetchCredentials();

  await expect(actual).rejects.toThrow();
});

test('should throw exception for authorizationKey as () => Promise<number>', async () => {
  const options = patchOptions({ authorizationToken: () => Promise.resolve(123), region: 'westus2' });
  const actual = options.fetchCredentials();

  await expect(actual).rejects.toThrow();
});

test('should throw exception for subscriptionKey as number', async () => {
  const options = patchOptions({ region: 'westus2', subscriptionKey: 123 });
  const actual = options.fetchCredentials();

  await expect(actual).rejects.toThrow();
});

test('should throw exception for subscriptionKey as Promise<number>', async () => {
  const options = patchOptions({ region: 'westus2', subscriptionKey: Promise.resolve(123) });
  const actual = options.fetchCredentials();

  await expect(actual).rejects.toThrow();
});

test('should throw exception for subscriptionKey as () => number', async () => {
  const options = patchOptions({ region: 'westus2', subscriptionKey: () => 123 });
  const actual = options.fetchCredentials();

  await expect(actual).rejects.toThrow();
});

test('should throw exception for subscriptionKey as () => Promise<number>', async () => {
  const options = patchOptions({ region: 'westus2', subscriptionKey: () => Promise.resolve(123) });
  const actual = options.fetchCredentials();

  await expect(actual).rejects.toThrow();
});

test('should throw exception when authorizationToken and subscriptionKey are not specified', async () => {
  expect(() => patchOptions({ region: 'westus2' })).toThrow();
});
