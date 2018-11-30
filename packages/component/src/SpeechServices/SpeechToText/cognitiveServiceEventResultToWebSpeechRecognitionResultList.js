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

export default function (result, { maxAlternatives = Infinity, textNormalization = 'display' } = {}) {
  if (result.reason === RecognizingSpeech) {
    return [[{
      confidence: .5,
      transcript: result.text
    }]];
  } else if (result.reason === RecognizedSpeech) {
    const resultList = [
      arrayToMap(
        (result.json.NBest || []).slice(0, maxAlternatives).map(
          ({
            Confidence: confidence,
            Display: display,
            ITN: itn,
            Lexical: lexical,
            MaskedITN: maskedITN
          }) => ({
            confidence,
            transcript:
              textNormalization === 'itn' ?
                itn
              : textNormalization === 'lexical' ?
                lexical
              : textNormalization === 'maskeditn' ?
                maskedITN
              :
                display
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
