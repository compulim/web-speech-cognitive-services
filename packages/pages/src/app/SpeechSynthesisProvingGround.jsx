import { useSelector } from 'react-redux';
import React from 'react';

import SpeechSynthesisCommands from './UI/SpeechSynthesisCommands.jsx';
import SpeechSynthesisDeploymentIdInput from './UI/SpeechSynthesisDeploymentIdInput.jsx';
import SpeechSynthesisOutputFormatSelector from './UI/SpeechSynthesisOutputFormatSelector.jsx';
import SpeechSynthesisTextBox from './UI/SpeechSynthesisTextBox.jsx';
import SpeechSynthesisUtterances from './UI/SpeechSynthesisUtterances.jsx';
import SpeechSynthesisVoiceSelector from './UI/SpeechSynthesisVoiceSelector.jsx';
import SpeechSynthesisVoiceURIInput from './UI/SpeechSynthesisVoiceURIInput.jsx';

const SpeechSynthesisProvingGround = () => {
  const hasVoices = useSelector(({ speechSynthesisNativeVoices }) => !!speechSynthesisNativeVoices.length);

  return (
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
        <div className="row">
          <div className="col col-md-9">
            {hasVoices ? (
              <React.Fragment>
                <label>Voice</label>
                <SpeechSynthesisVoiceSelector />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <label>Voice URI</label>
                <SpeechSynthesisVoiceURIInput />
              </React.Fragment>
            )}
          </div>
          <div className="col col-md-3">
            <label>Output format</label>
            <SpeechSynthesisOutputFormatSelector />
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
  );
};

export default SpeechSynthesisProvingGround;
