const TOKEN_URL = 'api.cognitive.microsoft.com/sts/v1.0/issueToken';
const DEFAULT_REGION = 'westus';

export default async function (subscriptionKey, region = DEFAULT_REGION, tokenUrl = null) {
  const res = await fetch(tokenUrl || `https://${ region }.${ TOKEN_URL }`, {
    headers: subscriptionKey ? {
      'Ocp-Apim-Subscription-Key': subscriptionKey
    } : undefined,
    method: 'POST'
  });

  if (res.status !== 200) {
    throw new Error(`Failed to fetch speech token, server returned ${ res.status }`);
  }

  return res.text();
}
