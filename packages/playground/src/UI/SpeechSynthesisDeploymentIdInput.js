import { connect } from 'react-redux';
import React from 'react';

import setSpeechSynthesisDeploymentId from '../data/actions/setSpeechSynthesisDeploymentId';

const SpeechSynthesisDeploymentId = ({
  disabled,
  deploymentId,
  setSpeechSynthesisDeploymentId
}) =>
  <input
    className="form-control"
    disabled={ disabled }
    onChange={ setSpeechSynthesisDeploymentId }
    type="text"
    value={ deploymentId }
  />

export default connect(
  ({
    ponyfillType,
    speechSynthesisDeploymentId
  }) => ({
    disabled: ponyfillType === 'browser' || ponyfillType === 'bingspeech',
    deploymentId: speechSynthesisDeploymentId
  }),
  {
    setSpeechSynthesisDeploymentId: ({ target: { value } }) => setSpeechSynthesisDeploymentId(value)
  }
)(SpeechSynthesisDeploymentId)
