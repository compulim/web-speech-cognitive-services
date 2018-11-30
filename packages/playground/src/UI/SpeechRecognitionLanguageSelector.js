import { connect } from 'react-redux';
import React from 'react';

import Select, { Option } from '../Bootstrap/Select';
import setSpeechRecognitionLanguage from '../data/actions/setSpeechRecognitionLanguage';

const RegionSelector = ({
  speechRecognitionLanguage,
  setSpeechRecognitionLanguage
}) =>
  <Select
    onChange={ setSpeechRecognitionLanguage }
    value={ speechRecognitionLanguage }
  >
    <Option text="English (US)" value="en-US" />
    <Option text="Chinese (Cantonese)" value="zh-HK" />
    <Option text="Chinese (Putonghua)" value="zh-CN" />
    <Option text="Japanese" value="ja-JP" />
    <Option text="Korean" value="ko-KR" />
  </Select>

export default connect(
  ({
    speechRecognitionLanguage
  }) => ({
    speechRecognitionLanguage
  }),
  { setSpeechRecognitionLanguage }
)(RegionSelector)
