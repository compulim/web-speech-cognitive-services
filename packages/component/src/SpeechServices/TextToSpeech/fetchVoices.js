/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, -1] }] */

import SpeechSynthesisVoice from './SpeechSynthesisVoice';

export default async function fetchVoices({ authorizationToken, region, speechSynthesisHost }) {
  // Although encodeURI on a hostname doesn't work as expected for hostname, at least, it will fail peacefully.

  if (!authorizationToken) {
    throw new Error('web-speech-cognitive-services: "authorizationToken" must be specified.');
  } else if (!region && !speechSynthesisHost) {
    throw new Error('web-speech-cognitive-services: Either "region" or "speechSynthesisHost" must be specified.');
  } else if (region && speechSynthesisHost) {
    throw new Error('web-speech-cognitive-services: Only either "region" or "speechSynthesisHost" can be specified.');
  }

  const host = speechSynthesisHost || `${encodeURI(region)}.tts.speech.microsoft.com`;
  const res = await fetch(`https://${host}/cognitiveservices/voices/list`, {
    headers: {
      authorization: `Bearer ${authorizationToken}`,
      'content-type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch voices');
  }

  const voices = await res.json();

  return voices
    .map(({ Gender: gender, Locale: lang, Name: voiceURI }) => new SpeechSynthesisVoice({ gender, lang, voiceURI }))
    .sort(({ name: x }, { name: y }) => (x > y ? 1 : x < y ? -1 : 0));
}
