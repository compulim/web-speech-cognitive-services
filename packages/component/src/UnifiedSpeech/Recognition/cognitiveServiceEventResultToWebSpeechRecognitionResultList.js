import SpeechSDK from '../SpeechSDK';

const {
  ResultReason: {
    RecognizingSpeech,
    RecognizedSpeech
  }
} = SpeechSDK;

function arrayToMap(array, extras) {
  return {
    ...array.reduce((map, value, index) => {
      map[index] = value;

      return map;
    }, {}),
    ...extras
  };
}

export default function (result) {
  if (result.reason === RecognizingSpeech) {
    return [[{
      confidence: .5,
      transcript: result.text
    }]];
  } else if (result.reason === RecognizedSpeech) {
    const resultList = [
      arrayToMap(
        (result.json.NBest || []).map(
          ({
            Confidence: confidence,
            Display: transcript
          }) => ({
            confidence,
            transcript
          })
        ),
        { isFinal: true }
      )
    ];

    return resultList;
  } else {
    return [];
  }
}
