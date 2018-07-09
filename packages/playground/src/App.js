import { css } from 'glamor';
import React from 'react';

import { SpeechGrammarList, SpeechRecognition, speechSynthesis, SpeechSynthesisUtterance } from 'component';
import DictationPane from './DictationPane';

const ROOT_CSS = css({
  display: 'flex'
});

const DICTATION_PANE_CSS = css({
  flex: 1
});

function getCognitiveServicesVoice() {
  return speechSynthesis.getVoices().find(v => v.lang === 'en-US');
}

export default class extends React.Component {
  constructor(props) {
    super(props);

    speechSynthesis.onvoicechanged = this.handleVoiceChanged;

    this.state = {
      cognitiveServicesVoice: getCognitiveServicesVoice()
    };
  }

  handleVoiceChanged() {
    this.setState(() => ({
      cognitiveServicesVoice: getCognitiveServicesVoice()
    }));
  }

  render() {
    const { state } = this;

    return (
      <div className={ ROOT_CSS }>
        <DictationPane
          className={ DICTATION_PANE_CSS + '' }
          name="Cognitive Services"
          speechGrammarList={ SpeechGrammarList }
          speechRecognition={ SpeechRecognition }
          speechSynthesis={ speechSynthesis }
          speechSynthesisUtterance={ SpeechSynthesisUtterance }
          voice={ state.cognitiveServicesVoice }
        />
        <DictationPane
          className={ DICTATION_PANE_CSS + '' }
          name="Web Speech API"
        />
      </div>
    );
  }
}
