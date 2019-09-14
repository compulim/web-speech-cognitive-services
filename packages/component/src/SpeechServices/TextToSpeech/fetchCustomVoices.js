/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, -1] }] */

import SpeechSynthesisVoice from './SpeechSynthesisVoice';

async function fetchEndpoint({ deploymentId, region, subscriptionKey }) {
  // Although encodeURI on a hostname doesn't work as expected for hostname, at least, it will fail peacefully.

  const res = await fetch(
    `https://${ encodeURI(region) }.cris.ai/api/texttospeech/v2.0/endpoints/${ encodeURIComponent(deploymentId) }`,
    {
      headers: {
        accept: 'application/json',
        'ocp-apim-subscription-key': subscriptionKey
      }
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch custom voices');
  }

  return res.json();
}

export default async function ({ deploymentId, region, subscriptionKey }) {
  const { models } = await fetchEndpoint({ deploymentId, region, subscriptionKey });

  return models
    .map(({ properties: { Gender: gender }, locale: lang, name: voiceURI }) => new SpeechSynthesisVoice({ gender, lang, voiceURI }))
    .sort(({ name: x }, { name: y }) => x > y ? 1 : x < y ? -1 : 0);
}
