import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback } from 'react';

import Select, { Option } from '../Bootstrap/Select';
import setPonyfillType from '../data/actions/setPonyfillType';

const PonyfillSelector = () => {
  const { browserSupportedSpeechRecognition, ponyfillType } = useSelector(({
    browserSupportedSpeechRecognition, ponyfillType
  }) => ({
    browserSupportedSpeechRecognition, ponyfillType
  }));

  const dispatch = useDispatch();
  const dispatchSetPonyfillType = useCallback(value => dispatch(setPonyfillType(value)), [dispatch]);

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
