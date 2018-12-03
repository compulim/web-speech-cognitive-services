import { connect } from 'react-redux';
import React from 'react';

import Select, { Option } from '../Bootstrap/Select';
import setPonyfillType from '../data/actions/setPonyfillType';

const PonyfillSelector = ({
  browserSupportedSpeechRecognition,
  ponyfillType,
  setPonyfillType
}) =>
  <Select
    onChange={ setPonyfillType }
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

export default connect(
  ({
    browserSupportedSpeechRecognition,
    ponyfillType
  }) => ({
    browserSupportedSpeechRecognition,
    ponyfillType
  }),
  { setPonyfillType }
)(PonyfillSelector)
