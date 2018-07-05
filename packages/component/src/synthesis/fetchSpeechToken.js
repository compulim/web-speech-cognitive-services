const TOKEN_URL = 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken';

export default async function fetchSpeechToken(subscriptionKey) {
  const res = await fetch(TOKEN_URL, {
    headers: {
      // 'Access-Control-Allow-Origin': '*',
      'Ocp-Apim-Subscription-Key': subscriptionKey
    },
    method: 'POST'
  });

  if (res.status !== 200) {
    throw new Error(`Failed to fetch speech token, server returned ${ res.status }`);
  }

  return res.text();
}
