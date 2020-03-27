import { decode } from 'base64-arraybuffer';
import buildSSML from './buildSSML';
import isSSML from './isSSML';

const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_OUTPUT_FORMAT = 'riff-16khz-16bit-mono-pcm';
const DEFAULT_VOICE = 'Microsoft Server Speech Text to Speech Voice (en-US, JessaRUS)';
const EMPTY_MP3_BASE64 =
  'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU3LjU2LjEwMQAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU3LjY0AAAAAAAAAAAAAAAAJAUHAAAAAAAAAYYoRBqpAAAAAAD/+xDEAAPAAAGkAAAAIAAANIAAAARMQU1FMy45OS41VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EMQpg8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

export default async function({
  deploymentId,
  fetchCredentials,
  lang = DEFAULT_LANGUAGE,
  outputFormat = DEFAULT_OUTPUT_FORMAT,
  pitch,
  rate,
  text,
  voice = DEFAULT_VOICE,
  volume
}) {
  if (!text) {
    // If text is empty, play a short audio clip. This allows developers to easily prime the AudioContext object by playing an empty string.
    return decode(EMPTY_MP3_BASE64);
  }

  const { authorizationToken, region, speechSynthesisHostname, subscriptionKey } = await fetchCredentials();

  if ((authorizationToken && subscriptionKey) || (!authorizationToken && !subscriptionKey)) {
    throw new Error('Only "authorizationToken" or "subscriptionKey" should be set.');
  } else if ((region && speechSynthesisHostname) || (!region && !speechSynthesisHostname)) {
    throw new Error('Only "region" or "speechSynthesisHostnamename" should be set.');
  }

  const ssml = isSSML(text) ? text : buildSSML({ lang, pitch, rate, text, voice, volume });

  // Although calling encodeURI on hostname does not actually works, it fails faster and safer.
  const hostname =
    speechSynthesisHostname ||
    (deploymentId
      ? `${ encodeURI(region) }.voice.speech.microsoft.com`
      : `${ encodeURI(region) }.tts.speech.microsoft.com`);
  const search = deploymentId ? `?deploymentId=${ encodeURI(deploymentId) }` : '';
  const url = `https://${ hostname }/cognitiveservices/v1${ search }`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': outputFormat,
      ...(authorizationToken
        ? {
            Authorization: `Bearer ${ authorizationToken }`
          }
        : {
            'Ocp-Apim-Subscription-Key': subscriptionKey
          })
    },
    method: 'POST',
    body: ssml
  });

  if (!res.ok) {
    throw new Error(`web-speech-cognitive-services: Failed to syntheis speech, server returned ${ res.status }`);
  }

  return res.arrayBuffer();
}
