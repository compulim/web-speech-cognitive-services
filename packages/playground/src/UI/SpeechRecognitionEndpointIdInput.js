import { connect } from 'react-redux';
import React from 'react';

import setSpeechRecognitionEndpointId from '../data/actions/setSpeechRecognitionEndpointId';

const SpeechRecognitionEndpointIdInput = ({
  disabled,
  endpointId,
  setSpeechRecognitionEndpointId
}) =>
  <input
    className="form-control"
    disabled={ disabled }
    onChange={ setSpeechRecognitionEndpointId }
    type="text"
    value={ endpointId }
  />

export default connect(
  ({
    ponyfillType,
    speechRecognitionEndpointId
  }) => ({
    disabled: ponyfillType === 'browser' || ponyfillType === 'bingspeech',
    endpointId: speechRecognitionEndpointId
  }),
  {
    setSpeechRecognitionEndpointId: ({ target: { value } }) => setSpeechRecognitionEndpointId(value)
  }
)(SpeechRecognitionEndpointIdInput)
