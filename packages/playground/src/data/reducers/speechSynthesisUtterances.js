import { ADD_SPEECH_SYNTHESIS_UTTERANCE } from '../actions/addSpeechSynthesisUtterance';
import { CLEAR_SPEECH_SYNTHESIS_UTTERANCE } from '../actions/clearSpeechSynthesisUtterance';

export default function (state = [], { payload, type }) {
  switch (type) {
    case ADD_SPEECH_SYNTHESIS_UTTERANCE:
      return [...state, payload.utterance];

    case CLEAR_SPEECH_SYNTHESIS_UTTERANCE:
      return [];

    default:
      return state;
  }
}
