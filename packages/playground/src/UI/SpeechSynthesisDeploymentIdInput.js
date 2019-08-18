import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback } from 'react';

import getPonyfillCapabilities from '../getPonyfillCapabilities';
import setSpeechSynthesisDeploymentId from '../data/actions/setSpeechSynthesisDeploymentId';

const SpeechSynthesisDeploymentIdInput = () => {
  const { ponyfillType, speechSynthesisDeploymentId } = useSelector(({
    ponyfillType, speechSynthesisDeploymentId
  }) => ({
    ponyfillType, speechSynthesisDeploymentId
  }));

  const dispatch = useDispatch();
  const dispatchSetSpeechSynthesisDeploymentId = useCallback(({ target: { value } }) => dispatch(setSpeechSynthesisDeploymentId(value)), [dispatch]);
  const ponyfillCapabilities = getPonyfillCapabilities(ponyfillType);

  return (
    <input
      className="form-control"
      disabled={ ponyfillCapabilities.customVoice }
      onChange={ dispatchSetSpeechSynthesisDeploymentId }
      type="text"
      value={ speechSynthesisDeploymentId }
    />
  );
}

export default SpeechSynthesisDeploymentIdInput
