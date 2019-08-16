import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback } from 'react';

import setSpeechSynthesisVoiceURI from '../data/actions/setSpeechSynthesisVoiceURI';

const SpeechSynthesisVoiceURIInput = () => {
  const { ponyfillType, speechSynthesisDeploymentId, speechSynthesisVoiceURI } = useSelector(({
    ponyfillType, speechSynthesisDeploymentId, speechSynthesisVoiceURI
  }) => ({
    ponyfillType, speechSynthesisDeploymentId, speechSynthesisVoiceURI
  }));

  const dispatch = useDispatch();
  const dispatchSetSpeechSynthesisvoiceURI = useCallback(({ target: { value } }) => dispatch(setSpeechSynthesisVoiceURI(value)), [dispatch]);

  return (
    <input
      className="form-control"
      disabled={ ponyfillType === 'browser' || ponyfillType === 'bingspeech' || !speechSynthesisDeploymentId }
      onChange={ dispatchSetSpeechSynthesisvoiceURI }
      type="text"
      value={ speechSynthesisVoiceURI }
    />
  );
}

export default SpeechSynthesisVoiceURIInput
