import SpeechSDK from '../SpeechSDK';

const {
  ResultReason: {
    RecognizingSpeech,
    RecognizedSpeech
  }
} = SpeechSDK;

export default function (result) {
  let resultList = [];

  if (result.reason === RecognizingSpeech) {
    resultList = [[{
      confidence: .5,
      transcript: result.text
    }]];
  } else if (result.reason === RecognizedSpeech) {
    resultList = [(result.json.NBest || []).map(
      ({
        Confidence: confidence,
        Display: transcript
      }) => ({
        confidence,
        transcript
      })
    )];

    if (result.reason === RecognizedSpeech) {
      resultList.isFinal = true;
    }
  }

  return resultList;
}
