import { SET_SPEECH_RECOGNITION_PHRASES } from '../actions/setSpeechRecognitionPhrases.ts';

export default function speechRecognitionPhrases(state = ['Bellevue', 'Redmond'], { payload, type }) {
  if (type === SET_SPEECH_RECOGNITION_PHRASES) {
    return payload.phrases;
  }

  return state;
}
