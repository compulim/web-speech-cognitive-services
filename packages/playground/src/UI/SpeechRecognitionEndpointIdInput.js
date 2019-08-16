import { useSelector } from 'react-redux';
import React from 'react';

import setSpeechRecognitionEndpointId from '../data/actions/setSpeechRecognitionEndpointId';
import useDispatchAction from '../useDispatchAction';

const SpeechRecognitionEndpointIdInput = () => {
  const { ponyfillType, speechRecognitionEndpointId } = useSelector(({
    ponyfillType, speechRecognitionEndpointId
  }) => ({
    ponyfillType, speechRecognitionEndpointId
  }));

  const dispatchSetSpeechRecognitionEndpointId = useDispatchAction(({ target: { value } }) => setSpeechRecognitionEndpointId(value));

  return (
    <input
      className="form-control"
      disabled={ ponyfillType === 'browser' || ponyfillType === 'bingspeech' }
      onChange={ dispatchSetSpeechRecognitionEndpointId }
      type="text"
      value={ speechRecognitionEndpointId }
    />
  );
}

export default SpeechRecognitionEndpointIdInput
