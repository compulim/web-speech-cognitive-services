import SpeechSDK from '../SpeechSDK';

const {
  ResultReason: {
    RecognizingSpeech,
    RecognizedSpeech
  }
} = SpeechSDK;

export default function (result) {
  if (result.reason === RecognizingSpeech) {
    return [[{
      confidence: .5,
      transcript: result.text
    }]];
  } else if (result.reason === RecognizedSpeech) {
    const resultList = [(result.json.NBest || []).map(
      ({
        Confidence: confidence,
        Display: transcript
      }) => ({
        confidence,
        transcript
      })
    )];

    resultList.isFinal = true;

    return resultList;
  } else {
    return [];
  }
}
