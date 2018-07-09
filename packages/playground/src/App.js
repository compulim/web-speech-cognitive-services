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

    const keyFromSearch = typeof window.URLSearchParams !== 'undefined' && new URLSearchParams(window.location.search).get('s');
    const keyFromStorage = typeof window.localStorage !== 'undefined' && window.localStorage.getItem('SPEECH_KEY');

    speechSynthesis.onvoicechanged = this.handleVoiceChanged;
    speechSynthesis.subscriptionKey = keyFromSearch || keyFromStorage;

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
