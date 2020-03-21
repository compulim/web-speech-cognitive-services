import fetch from 'node-fetch';

import buildSSML from './buildSSML';
import isSSML from './isSSML';

const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_OUTPUT_FORMAT = 'riff-16khz-16bit-mono-pcm';
const DEFAULT_VOICE = 'Microsoft Server Speech Text to Speech Voice (en-US, JessaRUS)';

export default async function fetchSpeechData({
  credentials,
  lang = DEFAULT_LANGUAGE,
  outputFormat = DEFAULT_OUTPUT_FORMAT,
  pitch,
  rate,
  text,
  voice = DEFAULT_VOICE,
  volume
}) {
  if (!credentials) {
    throw new Error('You must specify "credentials".');
  }

  const { authorizationToken, region, speechSynthesisHostname, subscriptionKey } = credentials;

  if (!region && !speechSynthesisHostname) {
    throw new Error('"credentials" must have either "region" or "speechSynthesisHostname" specified.');
  } else if (region && speechSynthesisHostname) {
    throw new Error('"credentials" must only have either "region" or "speechSynthesisHostname" specified.');
  } else if (!authorizationToken && !subscriptionKey) {
    throw new Error('"credentials" must have either "authorizationToken" or "subscriptionKey" specified.');
  }

  const ssml = isSSML(text) ? text : buildSSML({ lang, pitch, rate, text, voice, volume });

  // Although calling encodeURI on hostname does not actually works, it fails faster and safer.
  const host = speechSynthesisHostname || `${region}.tts.speech.microsoft.com`;
  const url = `https://${host}/cognitiveservices/v1`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': outputFormat,

      ...(authorizationToken
        ? {
            Authorization: `Bearer ${authorizationToken}`
          }
        : {
            'Ocp-Apim-Subscription-Key': subscriptionKey
          })
    },
    method: 'POST',
    body: ssml
  });

  if (!res.ok) {
    throw new Error(`Failed to syntheis speech, server returned ${res.status}`);
  }

  return await res.arrayBuffer();
}
