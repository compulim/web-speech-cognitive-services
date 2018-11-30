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
    ...extras,
    length: array.length
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
            Display: transcript,
            ITN: transcriptITN,
            Lexical: transcriptLexical,
            MaskedITN: transcriptMaskedITN
          }) => ({
            confidence,
            transcript,
            transcriptITN,
            transcriptLexical,
            transcriptMaskedITN
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
