import updateIn from 'simple-update-in';

import { ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE } from '../actions/addSpeechSynthesisNativeUtterance.ts';
import { ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE_EVENT } from '../actions/addSpeechSynthesisNativeUtteranceEvent.ts';
import { CLEAR_SPEECH_SYNTHESIS_UTTERANCE } from '../actions/clearSpeechSynthesisUtterance.ts';

function serializeEvent({ charIndex, elapsedTime, name, type }) {
  return {
    charIndex,
    elapsedTime,
    name,
    type
  };
}

export default function speechSynthesisUtterances(state = [], { payload, type }) {
  if (type === ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE) {
    const {
      nativeUtterance: { id, text, voice }
    } = payload;

    return [
      ...state,
      {
        events: [],
        id,
        text,
        voice: voice && {
          name: voice.name,
          voiceURI: voice.voiceURI
        }
      }
    ];
  } else if (type === ADD_SPEECH_SYNTHESIS_NATIVE_UTTERANCE_EVENT) {
    const { event, utteranceID } = payload;

    return updateIn(state, [({ id }) => id === utteranceID, 'events'], events => [...events, serializeEvent(event)]);
  } else if (type === CLEAR_SPEECH_SYNTHESIS_UTTERANCE) {
    return [];
  }

  return state;
}
