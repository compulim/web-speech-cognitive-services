import fetchVoices from './fetchVoices';

let originalFetch;

beforeEach(() => {
  originalFetch = global.fetch;
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe('Fetch voices', () => {
  test('happy path', async () => {
    global.fetch = jest.fn(async () => ({
      json: async () => [{
        Name: 'Microsoft Server Speech Text to Speech Voice (en-US, Jessa24kRUS)',
        ShortName: 'en-US-Jessa24kRUS',
        Gender: 'Female',
        Locale: 'en-US'
      }],
      ok: true
    }));

    const voices = await fetchVoices({ authorizationToken: 'AUTHORIZATION_TOKEN', region: 'westus' });
    const [firstVoice] = voices;

    expect(firstVoice).toHaveProperty('gender', 'Female');
    expect(firstVoice).toHaveProperty('lang', 'en-US');
    expect(firstVoice).toHaveProperty('name', 'Microsoft Server Speech Text to Speech Voice (en-US, Jessa24kRUS)');

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://westus.tts.speech.microsoft.com/cognitiveservices/voices/list',
      {
        headers: {
          authorization: 'Bearer AUTHORIZATION_TOKEN',
          'content-type': 'application/json'
        }
      }
    );
  });

  test('with network error', async () => {
    global.fetch = jest.fn(async () => ({ ok: false }));

    expect(fetchVoices({ authorizationToken: 'AUTHORIZATION_TOKEN', region: 'westus' })).rejects.toThrow('Failed to fetch voices');
  });
});
