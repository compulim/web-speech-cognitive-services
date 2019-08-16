import { useSelector } from 'react-redux';
import React from 'react';

import setSpeechSynthesisDeploymentId from '../data/actions/setSpeechSynthesisDeploymentId';
import useDispatchAction from '../useDispatchAction';

const SpeechSynthesisDeploymentIdInput = () => {
  const { ponyfillType, speechSynthesisDeploymentId } = useSelector(({
    ponyfillType, speechSynthesisDeploymentId
  }) => ({
    ponyfillType, speechSynthesisDeploymentId
  }));

  const dispatchSetSpeechSynthesisDeploymentId = useDispatchAction(({ target: { value } }) => setSpeechSynthesisDeploymentId(value));

  return (
    <input
      className="form-control"
      disabled={ ponyfillType === 'browser' || ponyfillType === 'bingspeech' }
      onChange={ dispatchSetSpeechSynthesisDeploymentId }
      type="text"
      value={ speechSynthesisDeploymentId }
    />
  );
}

export default SpeechSynthesisDeploymentIdInput
