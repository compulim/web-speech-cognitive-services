import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback } from 'react';

import Select, { Option } from '../Bootstrap/Select';
import setSpeechRecognitionLanguage from '../data/actions/setSpeechRecognitionLanguage';

const RegionSelector = () => {
  const speechRecognitionLanguage = useSelector(({ speechRecognitionLanguage }) => speechRecognitionLanguage);
  const dispatch = useDispatch();
  const dispatchSetSpeechRecognitionLanguage = useCallback(() => dispatch(setSpeechRecognitionLanguage()), [dispatch]);

  return (
    <Select
      onChange={ dispatchSetSpeechRecognitionLanguage }
      value={ speechRecognitionLanguage }
    >
      <Option text="English (US)" value="en-US" />
      <Option text="Chinese (Cantonese)" value="zh-HK" />
      <Option text="Chinese (Putonghua)" value="zh-CN" />
      <Option text="Japanese" value="ja-JP" />
      <Option text="Korean" value="ko-KR" />
    </Select>
  );
}

export default RegionSelector
