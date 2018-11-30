import { connect } from 'react-redux';
import React from 'react';

import Select, { Option } from '../Bootstrap/Select';
import setSpeechRecognitionTextNormalization from '../data/actions/setSpeechRecognitionTextNormalization';

const RegionSelector = ({
  disabled,
  speechRecognitionTextNormalization,
  setSpeechRecognitionTextNormalization
}) =>
  <Select
    disabled={ disabled }
    onChange={ setSpeechRecognitionTextNormalization }
    value={ speechRecognitionTextNormalization }
  >
    <Option text="Display (default)" value="display" />
    <Option text="ITN" value="itn" />
    <Option text="Masked ITN" value="maskeditn" />
    <Option text="Lexical" value="lexical" />
  </Select>

export default connect(
  ({
    ponyfillType,
    speechRecognitionTextNormalization
  }) => ({
    disabled: ponyfillType !== 'speechservices',
    speechRecognitionTextNormalization
  }),
  { setSpeechRecognitionTextNormalization }
)(RegionSelector)
