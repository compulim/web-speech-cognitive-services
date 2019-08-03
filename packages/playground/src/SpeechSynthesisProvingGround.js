import { connect } from 'react-redux';
import React from 'react';

import SpeechSynthesisCommands from './UI/SpeechSynthesisCommands';
import SpeechSynthesisDeploymentIdInput from './UI/SpeechSynthesisDeploymentIdInput';
import SpeechSynthesisTextBox from './UI/SpeechSynthesisTextBox';
import SpeechSynthesisUtterances from './UI/SpeechSynthesisUtterances';
import SpeechSynthesisVoiceSelector from './UI/SpeechSynthesisVoiceSelector';
import SpeechSynthesisVoiceURIInput from './UI/SpeechSynthesisVoiceURIInput';

const SpeechSynthesisProvingGround = ({
  hasVoices
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
          <label>Deployment ID</label>
          <SpeechSynthesisDeploymentIdInput />
        </div>
      </div>
      <br />
      {
        hasVoices ?
          <div className="row">
            <div className="col">
              <label>Voice</label>
              <SpeechSynthesisVoiceSelector />
            </div>
          </div>
        :
          <div className="row">
            <div className="col">
              <label>Voice URI</label>
              <SpeechSynthesisVoiceURIInput />
            </div>
          </div>
      }
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

export default connect(
  ({
    speechSynthesisNativeVoices
  }) => ({
    hasVoices: !!speechSynthesisNativeVoices.length
  })
)(SpeechSynthesisProvingGround)
