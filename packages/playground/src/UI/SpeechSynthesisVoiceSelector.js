import { connect } from 'react-redux';
import React from 'react';

import setSpeechSynthesisVoiceURI from '../data/actions/setSpeechSynthesisVoiceURI';
import Select, { Option } from '../Bootstrap/Select';

const SpeechSynthesisVoiceSelector = ({
  setSpeechSynthesisVoiceURI,
  speechSynthesisVoices,
  speechSynthesisVoiceURI
}) =>
  <Select
    onChange={ setSpeechSynthesisVoiceURI }
    value={ speechSynthesisVoiceURI }
  >
    { speechSynthesisVoices.map(({ name, voiceURI }) =>
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
    speechSynthesisVoices,
    speechSynthesisVoiceURI
  }) => ({
    ponyfill,
    speechSynthesisVoices,
    speechSynthesisVoiceURI
  }),
  { setSpeechSynthesisVoiceURI }
)(SpeechSynthesisVoiceSelector)
