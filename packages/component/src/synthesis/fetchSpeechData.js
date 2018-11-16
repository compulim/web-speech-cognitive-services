import buildSSML from './buildSSML';

const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_VOICE = 'Microsoft Server Speech Text to Speech Voice (en-US, JessaRUS)'
const SYNTHESIS_URL = 'tts.speech.microsoft.com/cognitiveservices/v1';
const DEFAULT_REGION = 'westus';

export default async function fetchSpeechData({
  accessToken,
  lang = DEFAULT_LANGUAGE,
  outputFormat,
  pitch,
  rate,
  text,
  voice = DEFAULT_VOICE,
  volume,
  gender = null,
  region = DEFAULT_REGION
}) {
  const ssml = buildSSML({ gender, lang, pitch, rate, text, voice, volume });

  const res = await fetch(`https://${ region }.${ SYNTHESIS_URL }`, {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': outputFormat
    },
    method: 'POST',
    body: ssml
  });

  if (res.status !== 200) {
    throw new Error(`Failed to synthesize speech, server returned ${ res.status }`);
  }

  return res.arrayBuffer();
}
