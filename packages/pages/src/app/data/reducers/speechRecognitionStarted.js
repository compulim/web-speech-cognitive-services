import { ABORT_SPEECH_RECOGNITION } from '../actions/abortSpeechRecognition.ts';
import { START_SPEECH_RECOGNITION } from '../actions/startSpeechRecognition.ts';
import { STOP_SPEECH_RECOGNITION } from '../actions/stopSpeechRecognition.ts';

export default function speechRecognitionStarted(state = false, { type }) {
  switch (type) {
    case ABORT_SPEECH_RECOGNITION:
      return false;

    case START_SPEECH_RECOGNITION:
      return true;

    case STOP_SPEECH_RECOGNITION:
      return false;

    default:
      return state;
  }
}
