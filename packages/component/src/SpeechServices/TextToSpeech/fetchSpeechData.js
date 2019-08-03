import { decode } from 'base64-arraybuffer';
import buildSSML from './buildSSML';

const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_VOICE = 'Microsoft Server Speech Text to Speech Voice (en-US, JessaRUS)'
const EMPTY_MP3_BASE64 = 'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjU2LjEwMQAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU3LjY0AAAAAAAAAAAAAAAAJAUHAAAAAAAAAYYoRBqpAAAAAAD/+xDEAAPAAAGkAAAAIAAANIAAAARMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EMQpg8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
const SYNTHESIS_CUSTOM_VOICE_URL_TEMPLATE = 'https://{region}.voice.speech.microsoft.com/cognitiveservices/v1?deploymentId={deploymentId}';
const SYNTHESIS_URL_TEMPLATE = 'https://{region}.tts.speech.microsoft.com/cognitiveservices/v1';

export default async function ({
  authorizationToken,
  deploymentId,
  lang = DEFAULT_LANGUAGE,
  outputFormat,
  pitch,
  rate,
  region,
  text,
  voice = DEFAULT_VOICE,
  volume
}) {
  if (!text) {
    // If text is empty, play a short audio clip. This allows developers to easily prime the AudioContext object by playing an empty string.
    return decode(EMPTY_MP3_BASE64);
  }

  const ssml = buildSSML({ lang, pitch, rate, text, voice, volume });

  // Although calling encodeURI on hostname does not actually works, it fails faster and safer.
  const url = deploymentId ?
    SYNTHESIS_CUSTOM_VOICE_URL_TEMPLATE.replace(/\{region\}/, encodeURI(region)).replace(/\{deploymentId\}/, encodeURI(deploymentId))
  :
    SYNTHESIS_URL_TEMPLATE.replace(/\{region\}/, encodeURI(region));

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
