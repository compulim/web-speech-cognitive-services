import buildSSML from './buildSSML';

const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_OUTPUT_FORMAT = 'riff-16khz-16bit-mono-pcm';
const DEFAULT_VOICE = 'Microsoft Server Speech Text to Speech Voice (en-US, JessaRUS)'
const SYNTHESIS_URL = 'https://speech.platform.bing.com/synthesize';

export default async function fetchSpeechData({
  lang = DEFAULT_LANGUAGE,
  outputFormat = DEFAULT_OUTPUT_FORMAT,
  speechToken,
  text,
  voice = DEFAULT_VOICE
}) {
  const ssml = buildSSML({ lang, text, voice });

  const res = await fetch(SYNTHESIS_URL, {
    headers: {
      Authorization: speechToken,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': outputFormat
    },
    method: 'POST',
    body: ssml
  });

  if (res.status !== 200) {
    throw new Error(`Failed to syntheis speech, server returned ${ res.status }`);
  }

  return res.arrayBuffer();
}
