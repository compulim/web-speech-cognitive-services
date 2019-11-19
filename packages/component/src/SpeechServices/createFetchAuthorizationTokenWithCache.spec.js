// jest.useFakeTimers() does not mock Date object, thus, we need to use Lolex.
import { install as installLolex } from 'lolex';

jest.mock('./fetchAuthorizationToken', () => jest.fn(async ({ subscriptionKey }) => `token:${ subscriptionKey }`));

import createFetchAuthorizationTokenWithCache from './createFetchAuthorizationTokenWithCache';

let clock;

beforeEach(() => {
  jest.clearAllMocks();
  clock = installLolex();
});

afterEach(() => {
  clock.uninstall();
});

test('should return cached result after 1 minute', async () => {
  const fetchAuthorizationToken = require('./fetchAuthorizationToken');
  const fetchAuthorizationTokenWithCache = createFetchAuthorizationTokenWithCache();

  await expect(fetchAuthorizationTokenWithCache({ region: 'westus', subscriptionKey: 'a1b2c3d' })).resolves.toBe('token:a1b2c3d');
  expect(fetchAuthorizationToken).toHaveBeenCalledTimes(1);
  expect(fetchAuthorizationToken).toHaveBeenCalledWith({ region: 'westus', subscriptionKey: 'a1b2c3d' });

  clock.tick(60000);

  await expect(fetchAuthorizationTokenWithCache({ region: 'westus', subscriptionKey: 'a1b2c3d' })).resolves.toBe('token:a1b2c3d');
  expect(fetchAuthorizationToken).toHaveBeenCalledTimes(1);
});

test('should fetch new authorization token after 10 minutes', async () => {
  const fetchAuthorizationToken = require('./fetchAuthorizationToken');
  const fetchAuthorizationTokenWithCache = createFetchAuthorizationTokenWithCache();

  await expect(fetchAuthorizationTokenWithCache({ region: 'westus', subscriptionKey: 'a1b2c3d' })).resolves.toBe('token:a1b2c3d');
  expect(fetchAuthorizationToken).toHaveBeenCalledTimes(1);
  expect(fetchAuthorizationToken).toHaveBeenCalledWith({ region: 'westus', subscriptionKey: 'a1b2c3d' });

  clock.tick(600000);

  await expect(fetchAuthorizationTokenWithCache({ region: 'westus', subscriptionKey: 'a1b2c3d' })).resolves.toBe('token:a1b2c3d');
  expect(fetchAuthorizationToken).toHaveBeenCalledTimes(2);

  clock.tick(60000);

  await expect(fetchAuthorizationTokenWithCache({ region: 'westus', subscriptionKey: 'a1b2c3d' })).resolves.toBe('token:a1b2c3d');
  expect(fetchAuthorizationToken).toHaveBeenCalledTimes(2);
});

test('should fetch new authorization token after region changed', async () => {
  const fetchAuthorizationToken = require('./fetchAuthorizationToken');
  const fetchAuthorizationTokenWithCache = createFetchAuthorizationTokenWithCache();

  await expect(fetchAuthorizationTokenWithCache({ region: 'westus', subscriptionKey: 'a1b2c3d' })).resolves.toBe('token:a1b2c3d');
  expect(fetchAuthorizationToken).toHaveBeenCalledTimes(1);
  expect(fetchAuthorizationToken).toHaveBeenCalledWith({ region: 'westus', subscriptionKey: 'a1b2c3d' });

  await expect(fetchAuthorizationTokenWithCache({ region: 'westus2', subscriptionKey: 'a1b2c3d' })).resolves.toBe('token:a1b2c3d');
  expect(fetchAuthorizationToken).toHaveBeenCalledTimes(2);
  expect(fetchAuthorizationToken).toHaveBeenCalledWith({ region: 'westus2', subscriptionKey: 'a1b2c3d' });
});

test('should fetch new authorization token after subscription key changed', async () => {
  const fetchAuthorizationToken = require('./fetchAuthorizationToken');
  const fetchAuthorizationTokenWithCache = createFetchAuthorizationTokenWithCache();

  await expect(fetchAuthorizationTokenWithCache({ region: 'westus', subscriptionKey: 'a1b2c3d' })).resolves.toBe('token:a1b2c3d');
  expect(fetchAuthorizationToken).toHaveBeenCalledTimes(1);
  expect(fetchAuthorizationToken).toHaveBeenCalledWith({ region: 'westus', subscriptionKey: 'a1b2c3d' });

  await expect(fetchAuthorizationTokenWithCache({ region: 'westus', subscriptionKey: 'd3c2b1a' })).resolves.toBe('token:d3c2b1a');
  expect(fetchAuthorizationToken).toHaveBeenCalledTimes(2);
  expect(fetchAuthorizationToken).toHaveBeenCalledWith({ region: 'westus', subscriptionKey: 'd3c2b1a' });
});
