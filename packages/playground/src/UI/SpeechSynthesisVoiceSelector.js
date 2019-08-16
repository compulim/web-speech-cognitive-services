import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback } from 'react';

import setSpeechSynthesisVoiceURI from '../data/actions/setSpeechSynthesisVoiceURI';
import Select, { Option } from '../Bootstrap/Select';

const SpeechSynthesisVoiceSelector = () => {
  const { speechSynthesisNativeVoices, speechSynthesisVoiceURI } = useSelector(({
    speechSynthesisNativeVoices, speechSynthesisVoiceURI
  }) => ({
    speechSynthesisNativeVoices, speechSynthesisVoiceURI
  }));

  const dispatch = useDispatch();
  const dispatchSetSpeechSynthesisVoiceURI = useCallback(() => dispatch(setSpeechSynthesisVoiceURI()), [dispatch]);

  return (
    <Select
      disabled={ !speechSynthesisNativeVoices.length }
      onChange={ dispatchSetSpeechSynthesisVoiceURI }
      value={ speechSynthesisVoiceURI || '' }
    >
      {
        speechSynthesisNativeVoices.map(({ name, voiceURI }) =>
          <Option
            key={ voiceURI }
            text={ name }
            value={ voiceURI }
          />
        )
      }
    </Select>
  );
}

export default SpeechSynthesisVoiceSelector
