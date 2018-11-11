const TOKEN_URL = 'https://speech.platform.bing.com/speech/recognition/interactive/cognitiveservices/v1?language=en-US&format=detailed';

export default async function (subscriptionKey) {
  const res = await fetch(TOKEN_URL, {
    headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey
    },
    method: 'POST'
  });

  if (res.status !== 200) {
    throw new Error(`Failed to fetch speech token, server returned ${ res.status }`);
  }

  return res.text();
}
