export default async function fetchSpeechServicesAuthorizationToken({ region, subscriptionKey, tokenURL }) {
  if (!subscriptionKey) {
    throw new Error('web-speech-cognitive-services: "subscriptionKey" must be specified.');
  } else if (!region && !tokenURL) {
    throw new Error('web-speech-cognitive-services: Either "region" or "tokenURL" must be specified.');
  } else if (region && tokenURL) {
    throw new Error('web-speech-cognitive-services: Only either "region" or "tokenURL" can be specified.');
  }

  const res = await fetch(tokenURL || `https://${encodeURI(region)}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
    headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey
    },
    method: 'POST'
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch authorization token, server returned ${res.status}`);
  }

  return res.text();
}
