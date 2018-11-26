import { ABORT_SPEECH_RECOGNITION } from '../actions/abortSpeechRecognition';
import { START_SPEECH_RECOGNITION } from '../actions/startSpeechRecognition';
import { STOP_SPEECH_RECOGNITION } from '../actions/stopSpeechRecognition';

export default function (state = false, { type }) {
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
