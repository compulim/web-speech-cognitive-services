import { SET_SPEECH_RECOGNITION_DELAYED_START } from '../actions/setSpeechRecognitionDelayedStart';

export default function (state = false, { payload, type }) {
  if (type === SET_SPEECH_RECOGNITION_DELAYED_START) {
    state = payload.delay;
  }

  return state;
}
