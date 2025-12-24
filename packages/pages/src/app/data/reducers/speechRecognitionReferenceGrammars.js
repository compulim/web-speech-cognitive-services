import { SET_SPEECH_RECOGNITION_REFERENCE_GRAMMARS } from '../actions/setSpeechRecognitionReferenceGrammars.ts';

export default function speechRecognitionReferenceGrammars(state = [], { payload, type }) {
  if (type === SET_SPEECH_RECOGNITION_REFERENCE_GRAMMARS) {
    return payload.referenceGrammars;
  }

  return state;
}
