import { useSelector } from 'react-redux';
import React from 'react';

import Select, { Option } from '../Bootstrap/Select';
import setPonyfillType from '../data/actions/setPonyfillType';
import useDispatchAction from '../useDispatchAction';

const PonyfillSelector = () => {
  const { browserSupportedSpeechRecognition, ponyfillType } = useSelector(({
    browserSupportedSpeechRecognition, ponyfillType
  }) => ({
    browserSupportedSpeechRecognition, ponyfillType
  }));

  const dispatchSetPonyfillType = useDispatchAction(setPonyfillType);

  return (
    <Select
      onChange={ dispatchSetPonyfillType }
      value={ ponyfillType }
    >
      <Option
        disabled={ !browserSupportedSpeechRecognition }
        text="Browser"
        value="browser"
      />
      <Option
        text="Bing Speech"
        value="bingspeech"
      />
      <Option
        text="Speech Services"
        value="speechservices"
      />
    </Select>
  );
}

export default PonyfillSelector
