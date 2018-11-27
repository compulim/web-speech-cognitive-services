import React from 'react';

import SpeechSynthesisCommands from './UI/SpeechSynthesisCommands';
import SpeechSynthesisTextBox from './UI/SpeechSynthesisTextBox';
import SpeechSynthesisUtterances from './UI/SpeechSynthesisUtterances';
import SpeechSynthesisVoiceSelector from './UI/SpeechSynthesisVoiceSelector';

export default () =>
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
          <label>Voice</label>
          <SpeechSynthesisVoiceSelector />
        </div>
      </div>
    </form>
    <br />
    <div className="row">
      <div className="col">
        <SpeechSynthesisCommands />
      </div>
    </div>
    <br />
    <div className="row">
      <div className="col">
        <SpeechSynthesisUtterances />
      </div>
    </div>
  </div>
