const TOKEN_URL_TEMPLATE = 'https://{region}.api.cognitive.microsoft.com/sts/v1.0/issueToken';

export default async function ({ region, subscriptionKey }) {
  const res = await fetch(
    TOKEN_URL_TEMPLATE.replace(/\{region\}/, region),
    {
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey
      },
      method: 'POST'
    }
  );

  if (res.status !== 200) {
    throw new Error(`Failed to fetch access token, server returned ${ res.status }`);
  }

  return res.text();
}
