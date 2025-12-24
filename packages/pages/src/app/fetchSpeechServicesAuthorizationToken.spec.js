/// <reference types="jest" />

import fetchSpeechServicesAuthorizationToken from './fetchSpeechServicesAuthorizationToken';

test('fetch using region and subscriptionKey', async () => {
  global.fetch = jest.fn(async () => {
    const res = {
      ok: true,
      text: async () => 'TOKEN'
    };

    return res;
  });

  const tokenPromise = fetchSpeechServicesAuthorizationToken({
    region: 'westus2',
    subscriptionKey: 'SUBSCRIPTION_KEY'
  });

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch).toHaveBeenCalledWith('https://westus2.api.cognitive.microsoft.com/sts/v1.0/issueToken', {
    headers: {
      'Ocp-Apim-Subscription-Key': 'SUBSCRIPTION_KEY'
    },
    method: 'POST'
  });

  await expect(tokenPromise).resolves.toBe('TOKEN');
});

test('fetch using subscriptionKey and tokenURL', async () => {
  global.fetch = jest.fn(async () => {
    const res = {
      ok: true,
      text: async () => 'TOKEN'
    };

    return res;
  });

  const tokenPromise = fetchSpeechServicesAuthorizationToken({
    subscriptionKey: 'SUBSCRIPTION_KEY',
    tokenURL: 'https://virginia.api.cognitive.microsoft.us/sts/v1.0/issueToken'
  });

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch).toHaveBeenCalledWith('https://virginia.api.cognitive.microsoft.us/sts/v1.0/issueToken', {
    headers: {
      'Ocp-Apim-Subscription-Key': 'SUBSCRIPTION_KEY'
    },
    method: 'POST'
  });

  await expect(tokenPromise).resolves.toBe('TOKEN');
});

test('throw exception when fetching with both "region" and "tokenURL"', async () => {
  const tokenPromise = fetchSpeechServicesAuthorizationToken({
    region: 'westus2',
    subscriptionKey: 'SUBSCRIPTION_KEY',
    tokenURL: 'https://virginia.api.cognitive.microsoft.us/sts/v1.0/issueToken'
  });

  expect(tokenPromise).rejects.toThrow('either');
});

test('throw exception when fetching with neither of "region" and "tokenURL"', async () => {
  const tokenPromise = fetchSpeechServicesAuthorizationToken({ subscriptionKey: 'SUBSCRIPTION_KEY' });

  expect(tokenPromise).rejects.toThrow('Either');
});

test('throw exception when fetching without "subscriptionKey"', async () => {
  const tokenPromise = fetchSpeechServicesAuthorizationToken({ region: 'westus2' });

  expect(tokenPromise).rejects.toThrow('must be specified');
});
