import updateIn from 'simple-update-in';

import { ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE } from '../actions/addSpeechSynthesisNativeUtterance';
import { ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE_EVENT } from '../actions/addSpeechSynthesisNativeUtteranceEvent';
import { CLEAR_SPEECH_SYNTHESIS_UTTERANCE } from '../actions/clearSpeechSynthesisUtterance';

function serializeEvent({ charIndex, elapsedTime, name }) {
  return {
    charIndex,
    elapsedTime,
    name
  };
}

export default function (state = [], { payload, type }) {
  switch (type) {
    case ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE:
      const {
        nativeUtterance: {
          id,
          text,
          voice: { name, voiceURI } = {}
        }
      } = payload;

      return [
        ...state,
        {
          events: [],
          id,
          text,
          voice: {
            name,
            voiceURI
          }
        }
      ];

    case ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE_EVENT:
      const { event, utteranceID } = payload;

      return updateIn(
        state,
        [({ id }) => id === utteranceID, 'events'],
        events => [...events, serializeEvent(event)]
      );

    case CLEAR_SPEECH_SYNTHESIS_UTTERANCE:
      return [];

    default:
      return state;
  }
}
