import { useSelector } from 'react-redux';
import React from 'react';

import setSpeechSynthesisVoiceURI from '../data/actions/setSpeechSynthesisVoiceURI';
import Select, { Option } from '../Bootstrap/Select';
import useDispatchAction from '../useDispatchAction';

const SpeechSynthesisVoiceSelector = () => {
  const { speechSynthesisNativeVoices, speechSynthesisVoiceURI } = useSelector(({
    speechSynthesisNativeVoices, speechSynthesisVoiceURI
  }) => ({
    speechSynthesisNativeVoices, speechSynthesisVoiceURI
  }));

  const dispatchSetSpeechSynthesisVoiceURI = useDispatchAction(setSpeechSynthesisVoiceURI);

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
