import { connect } from 'react-redux';
import React from 'react';

import setSpeechSynthesisVoiceURI from '../data/actions/setSpeechSynthesisVoiceURI';

const SpeechSynthesisVoiceURIInput = ({
  disabled,
  speechSynthesisVoiceURI,
  setSpeechSynthesisVoiceURI
}) =>
  <input
    className="form-control"
    disabled={ disabled }
    onChange={ setSpeechSynthesisVoiceURI }
    type="text"
    value={ speechSynthesisVoiceURI }
  />

export default connect(
  ({
    ponyfillType,
    speechSynthesisDeploymentId,
    speechSynthesisVoiceURI
  }) => ({
    disabled: ponyfillType === 'browser' || ponyfillType === 'bingspeech' || !speechSynthesisDeploymentId,
    speechSynthesisVoiceURI
  }),
  {
    setSpeechSynthesisVoiceURI: ({ target: { value } }) => setSpeechSynthesisVoiceURI(value)
  }
)(SpeechSynthesisVoiceURIInput)
