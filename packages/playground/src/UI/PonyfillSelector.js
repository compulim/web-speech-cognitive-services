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
    disabledValues={ browserSupportedSpeechRecognition ? [] : ['browser'] }
    onChange={ setPonyfillType }
    value={ ponyfillType }
  >
    <Option
      text="Browser"
      value="browser"
    />
    <Option
      text="Cognitive Services"
      value="cognitiveservices"
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
