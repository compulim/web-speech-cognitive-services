import { expect } from 'expect';
import { afterEach, beforeEach, describe, mock, test } from 'node:test';
import fetchVoices from './fetchVoices.js';

let fetchMock;

beforeEach(() => {
  fetchMock = mock.method(globalThis, 'fetch');
});

afterEach(() => {
  fetchMock.mock.restore();
});

describe('Fetch voices', () => {
  test('happy path', async () => {
    fetchMock.mock.mockImplementation(async () => ({
      json: async () => [
        {
          Name: 'Microsoft Server Speech Text to Speech Voice (en-US, AriaNeural)',
          ShortName: 'en-US-AriaNeural',
          Gender: 'Female',
          Locale: 'en-US'
        }
      ],
      ok: true
    }));

    const voices = await fetchVoices({ authorizationToken: 'AUTHORIZATION_TOKEN', region: 'westus' });
    const [firstVoice] = voices;

    expect(firstVoice).toHaveProperty('gender', 'Female');
    expect(firstVoice).toHaveProperty('lang', 'en-US');
    expect(firstVoice).toHaveProperty('name', 'Microsoft Server Speech Text to Speech Voice (en-US, AriaNeural)');

    expect(globalThis.fetch.mock.callCount()).toBe(1);
    expect(globalThis.fetch.mock.calls[0]?.arguments).toEqual([
      'https://westus.tts.speech.microsoft.com/cognitiveservices/voices/list',
      {
        headers: {
          authorization: 'Bearer AUTHORIZATION_TOKEN',
          'content-type': 'application/json'
        }
      }
    ]);
  });

  test('with network error', async () => {
    fetchMock.mock.mockImplementation(async () => ({ ok: false }));

    expect(fetchVoices({ authorizationToken: 'AUTHORIZATION_TOKEN', region: 'westus' })).rejects.toThrow(
      'Failed to fetch voices'
    );
  });
});
