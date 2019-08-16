import { useSelector } from 'react-redux';
import React from 'react';

import setSpeechSynthesisVoiceURI from '../data/actions/setSpeechSynthesisVoiceURI';
import useDispatchAction from '../useDispatchAction';

const SpeechSynthesisVoiceURIInput = () => {
  const { ponyfillType, speechSynthesisDeploymentId, speechSynthesisVoiceURI } = useSelector(({
    ponyfillType, speechSynthesisDeploymentId, speechSynthesisVoiceURI
  }) => ({
    ponyfillType, speechSynthesisDeploymentId, speechSynthesisVoiceURI
  }));

  const dispatchSetSpeechSynthesisvoiceURI = useDispatchAction(({ target: { value } }) => setSpeechSynthesisVoiceURI(value));

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
