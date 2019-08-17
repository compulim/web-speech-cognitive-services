import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback } from 'react';

import setSpeechRecognitionEndpointId from '../data/actions/setSpeechRecognitionEndpointId';

const SpeechRecognitionEndpointIdInput = () => {
  const { ponyfillType, speechRecognitionEndpointId } = useSelector(({
    ponyfillType, speechRecognitionEndpointId
  }) => ({
    ponyfillType, speechRecognitionEndpointId
  }));

  const dispatch = useDispatch();
  const dispatchSetSpeechRecognitionEndpointId = useCallback(({ target: { value } }) => dispatch(setSpeechRecognitionEndpointId(value)), [dispatch]);

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
