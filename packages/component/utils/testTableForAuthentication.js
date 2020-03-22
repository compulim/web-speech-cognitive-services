import createTestTable from './createTestTable';

function createTestTableForAuthentication() {
  const combos = [
    [true, false],
    [
      { region: 'westus2' },
      {
        speechRecognitionHostname: 'westus2.stt.speech.microsoft.com',
        speechSynthesisHostname: 'westus2.tts.speech.microsoft.com',
        tokenURL: 'https://westus2.api.cognitive.microsoft.com/sts/v1.0/issueToken'
      }
    ]
  ];

  return createTestTable(combos, (useAuthorizationToken, { region }) =>
    [useAuthorizationToken ? 'authorization token' : 'subscription key', region ? 'region' : 'host'].join(' and ')
  );
}

export default createTestTableForAuthentication();
