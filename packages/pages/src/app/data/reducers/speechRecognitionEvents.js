import { ADD_SPEECH_RECOGNITION_EVENT } from '../actions/addSpeechRecognitionEvent.ts';
import { CLEAR_SPEECH_RECOGNITION_EVENT } from '../actions/clearSpeechRecognitionEvent.ts';

export default function speechRecognitionEvents(state = [], { payload, type }) {
  switch (type) {
    case ADD_SPEECH_RECOGNITION_EVENT:
      return [...state, payload.event];

    case CLEAR_SPEECH_RECOGNITION_EVENT:
      return [];

    default:
      return state;
  }
}
