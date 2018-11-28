import buildSSML from './buildSSML';

const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_VOICE = 'Microsoft Server Speech Text to Speech Voice (en-US, JessaRUS)'
const SYNTHESIS_URL_TEMPLATE = 'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1';

export default async function ({
  authorizationToken,
  lang = DEFAULT_LANGUAGE,
  outputFormat,
  pitch,
  rate,
  region,
  text,
  voice = DEFAULT_VOICE,
  volume
}) {
  const ssml = buildSSML({ lang, pitch, rate, text, voice, volume });
  const url = SYNTHESIS_URL_TEMPLATE.replace(/\{region\}/, region);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ authorizationToken }`,
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
