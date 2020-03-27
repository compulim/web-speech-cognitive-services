/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, -1] }] */

import SpeechSynthesisVoice from './SpeechSynthesisVoice';

export default async function fetchVoices({ authorizationToken, region, speechSynthesisHostname, subscriptionKey }) {
  // Although encodeURI on a hostname doesn't work as expected for hostname, at least, it will fail peacefully.
  const hostname = speechSynthesisHostname || `${ encodeURI(region) }.tts.speech.microsoft.com`;
  const res = await fetch(`https://${ hostname }/cognitiveservices/voices/list`, {
    headers: {
      'content-type': 'application/json',
      ...(authorizationToken
        ? {
            authorization: `Bearer ${ authorizationToken }`
          }
        : {
            'Ocp-Apim-Subscription-Key': subscriptionKey
          })
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
