import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Select, { Option } from '../Bootstrap/Select';
import setSpeechRecognitionInitialSilenceTimeout from '../data/actions/setSpeechRecognitionInitialSilenceTimeout';
import getPonyfillCapabilities from '../getPonyfillCapabilities';

const SpeechRecognitionInitialSilenceTimeoutSelector = () => {
  const { ponyfillType, speechRecognitionInitialSilenceTimeout } = useSelector(
    ({
      ponyfillType,
      speechRecognitionInitialSilenceTimeout
    }: {
      ponyfillType: unknown;
      speechRecognitionInitialSilenceTimeout: number | undefined;
    }) => ({
      ponyfillType,
      speechRecognitionInitialSilenceTimeout
    })
  );

  const dispatch = useDispatch();
  const handleChange = useCallback(
    (value: string) =>
      dispatch(
        setSpeechRecognitionInitialSilenceTimeout(value === '1000' ? 1_000 : value === '5000' ? 5_000 : 'default')
      ),
    [dispatch]
  );
  const ponyfillCapabilities = getPonyfillCapabilities(ponyfillType);

  return (
    <Select
      disabled={!ponyfillCapabilities.inverseTextNormalization}
      onChange={handleChange}
      value={
        speechRecognitionInitialSilenceTimeout === 1_000
          ? '1000'
          : speechRecognitionInitialSilenceTimeout === 5_000
            ? '5000'
            : 'default'
      }
    >
      <Option text="Default timeout" value="default" />
      <Option text="1 second timeout" value="1000" />
      <Option text="5 seconds timeout" value="5000" />
    </Select>
  );
};

export default SpeechRecognitionInitialSilenceTimeoutSelector;
