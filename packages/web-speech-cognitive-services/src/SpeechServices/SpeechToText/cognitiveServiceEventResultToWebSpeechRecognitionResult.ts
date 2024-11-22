import SpeechSDK from '../SpeechSDK';

import SpeechRecognitionAlternative from './SpeechRecognitionAlternative';
import SpeechRecognitionResult from './SpeechRecognitionResult';
import type { SerializedRecognitionResult } from './private/serializeRecognitionResult';

const {
  ResultReason: { RecognizingSpeech, RecognizedSpeech }
} = SpeechSDK;

export default function (
  result: SerializedRecognitionResult,
  init?:
    | {
        maxAlternatives: number;
        textNormalization: 'display' | 'itn' | 'lexical' | 'maskeditn';
      }
    | undefined
): SpeechRecognitionResult {
  const { maxAlternatives = Infinity, textNormalization = 'display' } = init || {};
  const json: {
    NBest: readonly {
      Confidence: number;
      Display: string;
      ITN: string;
      Lexical: string;
      MaskedITN: string;
    }[];
  } = typeof result.json === 'string' ? JSON.parse(result.json) : result.json;

  if (result.reason === RecognizingSpeech || (result.reason === RecognizedSpeech && !json.NBest)) {
    return new SpeechRecognitionResult({
      isFinal: result.reason === RecognizedSpeech,
      results: [
        new SpeechRecognitionAlternative({
          confidence: 0.5,
          transcript: result.text
        })
      ]
    });
  } else if (result.reason === RecognizedSpeech) {
    return new SpeechRecognitionResult({
      isFinal: true,
      results: (json.NBest || []).slice(0, maxAlternatives).map(
        ({ Confidence: confidence, Display: display, ITN: itn, Lexical: lexical, MaskedITN: maskedITN }) =>
          new SpeechRecognitionAlternative({
            confidence,
            transcript:
              textNormalization === 'itn'
                ? itn
                : textNormalization === 'lexical'
                  ? lexical
                  : textNormalization === 'maskeditn'
                    ? maskedITN
                    : display
          })
      )
    });
  }

  return new SpeechRecognitionResult({ isFinal: false, results: [] });
}
