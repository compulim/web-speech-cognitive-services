import createTestTable from './createTestTable.js';
import fetchAuthorizationToken from './fetchAuthorizationToken.js';

function createTestTableForAuthentication() {
  const combos = [
    [true, false],
    [
      { region: 'westus2' },
      {
        speechRecognitionHostname: 'westus2.stt.speech.microsoft.com',
        speechSynthesisHostname: 'westus2.tts.speech.microsoft.com'
      }
    ]
  ];

  return createTestTable(combos, (useAuthorizationToken, { region }) =>
    [useAuthorizationToken ? 'authorization token' : 'subscription key', region ? 'region' : 'host'].join(' and ')
  ).map(([name, useAuthorizationToken, mergeCredentials]) => [
    name,
    useAuthorizationToken,
    mergeCredentials,
    async () => {
      const credentials = { ...mergeCredentials };

      if (useAuthorizationToken) {
        credentials.authorizationToken = await fetchAuthorizationToken({
          subscriptionKey: process.env.SUBSCRIPTION_KEY,
          ...(mergeCredentials.region
            ? {}
            : { tokenURL: 'https://westus2.api.cognitive.microsoft.com/sts/v1.0/issueToken' }),
          ...mergeCredentials
        });
      } else {
        credentials.subscriptionKey = process.env.SUBSCRIPTION_KEY;
      }

      return credentials;
    }
  ]);
}

export default createTestTableForAuthentication();
