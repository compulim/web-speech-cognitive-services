import { css } from 'glamor';
import React from 'react';

import { SpeechGrammarList, SpeechRecognition, speechSynthesis, SpeechSynthesisUtterance, SubscriptionKey } from 'component';
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

    const keyFromSearch = typeof window.URLSearchParams !== 'undefined' && new URLSearchParams(window.location.search).get('s');
    const keyFromStorage = typeof window.localStorage !== 'undefined' && window.localStorage.getItem('SPEECH_KEY');
    const speechToken = new SubscriptionKey(keyFromSearch || keyFromStorage);

    speechSynthesis.speechToken = speechToken;

    this.state = {
      cognitiveServicesVoice: getCognitiveServicesVoice(),
      speechToken
    };
  }

  async componentDidMount() {
    await this.state.speechToken.authorized;

    this.setState(() => ({ ready: true }));
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
          disabled={ !state.ready }
          name="Cognitive Services"
          speechGrammarList={ SpeechGrammarList }
          speechRecognition={ SpeechRecognition }
          speechSynthesis={ speechSynthesis }
          speechSynthesisUtterance={ SpeechSynthesisUtterance }
          speechToken={ state.speechToken }
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
