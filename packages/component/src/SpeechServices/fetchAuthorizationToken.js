const TOKEN_URL_TEMPLATE = 'https://{region}.api.cognitive.microsoft.com/sts/v1.0/issueToken';

export default async function ({ region, subscriptionKey, url }) {
  if (region && url) {
    throw new Error('web-speech-cognitive-services: Only either "region" or "url" can be specified when fetching authorization token.');
  }

  const res = await fetch(
    url || TOKEN_URL_TEMPLATE.replace(/\{region\}/u, region),
    {
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey
      },
      method: 'POST'
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch authorization token, server returned ${ res.status }`);
  }

  return res.text();
}
