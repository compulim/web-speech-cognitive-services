import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback } from 'react';

import getPonyfillCapabilities from '../getPonyfillCapabilities';
import Select, { Option } from '../Bootstrap/Select';
import setSpeechRecognitionTextNormalization from '../data/actions/setSpeechRecognitionTextNormalization';

const RegionSelector = () => {
  const { ponyfillType, speechRecognitionTextNormalization } = useSelector(
    ({ ponyfillType, speechRecognitionTextNormalization }) => ({
      ponyfillType,
      speechRecognitionTextNormalization
    })
  );

  const dispatch = useDispatch();
  const handleChange = useCallback(value => dispatch(setSpeechRecognitionTextNormalization(value)), [dispatch]);
  const ponyfillCapabilities = getPonyfillCapabilities(ponyfillType);

  return (
    <Select
      disabled={!ponyfillCapabilities.inverseTextNormalization}
      onChange={handleChange}
      value={speechRecognitionTextNormalization}
    >
      <Option text="Display (default)" value="display" />
      <Option text="ITN" value="itn" />
      <Option text="Masked ITN" value="maskeditn" />
      <Option text="Lexical" value="lexical" />
    </Select>
  );
};

export default RegionSelector;
