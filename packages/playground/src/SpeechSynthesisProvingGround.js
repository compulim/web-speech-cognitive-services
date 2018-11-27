import { connect } from 'react-redux';
import React from 'react';

import SpeechSynthesisCommands from './UI/SpeechSynthesisCommands';
import SpeechSynthesisTextBox from './UI/SpeechSynthesisTextBox';
import SpeechSynthesisVoiceSelector from './UI/SpeechSynthesisVoiceSelector';

const SpeechSynthesisProvingGround = ({
  ponyfill
}) =>
  <div>
    <form>
      <div className="row">
        <div className="col">
          <label>Text to synthesis</label>
          <SpeechSynthesisTextBox />
        </div>
      </div>
      <br />
      <div className="row">
        <div className="col">
          <SpeechSynthesisVoiceSelector ponyfill={ ponyfill } />
        </div>
      </div>
    </form>
    <br />
    <div className="row">
      <div className="col">
        <SpeechSynthesisCommands />
      </div>
    </div>
  </div>

export default connect(
  ({}) => ({})
)(SpeechSynthesisProvingGround)
