import { useSelector } from 'react-redux';
import React from 'react';

import Select, { Option } from '../Bootstrap/Select';
import setSpeechRecognitionTextNormalization from '../data/actions/setSpeechRecognitionTextNormalization';
import useDispatchAction from '../useDispatchAction';

const RegionSelector = () => {
  const { ponyfillType, speechRecognitionTextNormalization } = useSelector(({
    ponyfillType, speechRecognitionTextNormalization
  }) => ({
    ponyfillType, speechRecognitionTextNormalization
  }));

  const handleChange = useDispatchAction(setSpeechRecognitionTextNormalization);

  return (
    <Select
      disabled={ ponyfillType !== 'bingspeech' && ponyfillType !== 'speechservices' }
      onChange={ handleChange }
      value={ speechRecognitionTextNormalization }
    >
      <Option text="Display (default)" value="display" />
      <Option text="ITN" value="itn" />
      <Option text="Masked ITN" value="maskeditn" />
      <Option text="Lexical" value="lexical" />
    </Select>
  );
}

export default RegionSelector
