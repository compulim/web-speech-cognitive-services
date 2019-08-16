import { useSelector } from 'react-redux';
import React from 'react';

import SpeechSynthesisCommands from './UI/SpeechSynthesisCommands';
import SpeechSynthesisDeploymentIdInput from './UI/SpeechSynthesisDeploymentIdInput';
import SpeechSynthesisOutputFormatSelector from './UI/SpeechSynthesisOutputFormatSelector';
import SpeechSynthesisTextBox from './UI/SpeechSynthesisTextBox';
import SpeechSynthesisUtterances from './UI/SpeechSynthesisUtterances';
import SpeechSynthesisVoiceSelector from './UI/SpeechSynthesisVoiceSelector';
import SpeechSynthesisVoiceURIInput from './UI/SpeechSynthesisVoiceURIInput';

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
            {
              hasVoices ?
                <React.Fragment>
                  <label>Voice</label>
                  <SpeechSynthesisVoiceSelector />
                </React.Fragment>
              :
                <React.Fragment>
                  <label>Voice URI</label>
                  <SpeechSynthesisVoiceURIInput />
                </React.Fragment>
            }
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
}

export default SpeechSynthesisProvingGround
