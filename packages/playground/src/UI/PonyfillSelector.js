import { connect } from 'react-redux';
import React from 'react';

import Select from '../Bootstrap/Select';
import setPonyfillType from '../data/actions/setPonyfillType';

const PONYFILLS = {
  browser: 'Browser',
  cognitiveservices: 'Cognitive Services',
  both: 'Both'
};

const PonyfillSelector = ({
  browserSupportedSpeechRecognition,
  ponyfillType,
  setPonyfillType
}) =>
  <Select
    disabledValues={ browserSupportedSpeechRecognition ? [] : ['browser'] }
    onChange={ setPonyfillType }
    value={ ponyfillType }
    values={ PONYFILLS }
  />

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
