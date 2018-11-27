import { connect } from 'react-redux';
import React from 'react';

import setSpeechSynthesisVoiceURI from '../data/actions/setSpeechSynthesisVoiceURI';
import Select, { Option } from '../Bootstrap/Select';

const SpeechSynthesisVoiceSelector = ({
  setSpeechSynthesisVoiceURI,
  speechSynthesisNativeVoices,
  speechSynthesisVoiceURI
}) =>
  <Select
    onChange={ setSpeechSynthesisVoiceURI }
    value={ speechSynthesisVoiceURI || '' }
  >
    { speechSynthesisNativeVoices.map(({ name, voiceURI }) =>
      <Option
        key={ voiceURI }
        text={ name }
        value={ voiceURI }
      />
    ) }
  </Select>

export default connect(
  ({
    ponyfill,
    speechSynthesisNativeVoices,
    speechSynthesisVoiceURI
  }) => ({
    ponyfill,
    speechSynthesisNativeVoices,
    speechSynthesisVoiceURI
  }),
  { setSpeechSynthesisVoiceURI }
)(SpeechSynthesisVoiceSelector)
