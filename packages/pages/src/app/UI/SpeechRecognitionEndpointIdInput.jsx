import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback } from 'react';

import getPonyfillCapabilities from '../getPonyfillCapabilities.js';
import setSpeechRecognitionEndpointId from '../data/actions/setSpeechRecognitionEndpointId.ts';

const SpeechRecognitionEndpointIdInput = () => {
  const { ponyfillType, speechRecognitionEndpointId } = useSelector(
    ({ ponyfillType, speechRecognitionEndpointId }) => ({
      ponyfillType,
      speechRecognitionEndpointId
    })
  );

  const dispatch = useDispatch();
  const dispatchSetSpeechRecognitionEndpointId = useCallback(
    ({ target: { value } }) => dispatch(setSpeechRecognitionEndpointId(value)),
    [dispatch]
  );
  const ponyfillCapabilities = getPonyfillCapabilities(ponyfillType);

  return (
    <input
      className="form-control"
      disabled={!ponyfillCapabilities.customSpeech}
      onChange={dispatchSetSpeechRecognitionEndpointId}
      type="text"
      value={speechRecognitionEndpointId}
    />
  );
};

export default SpeechRecognitionEndpointIdInput;
