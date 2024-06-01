import { SET_SPEECH_RECOGNITION_LANGUAGE } from '../actions/setSpeechRecognitionLanguage';

export default function speechRecognitionLanguage(state = 'en-US', { payload, type }) {
  switch (type) {
    case SET_SPEECH_RECOGNITION_LANGUAGE:
      return payload.language;

    default:
      return state;
  }
}
