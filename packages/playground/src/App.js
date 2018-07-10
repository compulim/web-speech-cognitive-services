import { css } from 'glamor';
import React from 'react';

import {
  SpeechGrammarList,
  SpeechRecognition,
  speechSynthesis,
  SpeechSynthesisUtterance,
  SubscriptionKey
} from 'component';

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

    const cognitiveServicesGrammars = new SpeechGrammarList();

    cognitiveServicesGrammars.words = ['Tuen Mun', 'Yuen Long'];

    const webSpeechGrammarListClass = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const webSpeechGrammars = webSpeechGrammarListClass && new webSpeechGrammarListClass();

    webSpeechGrammars && webSpeechGrammars.addFromString('#JSGF V1.0; grammar districts; public <district> = tuen mun | yuen long;', 1);

    this.state = {
      cognitiveServicesGrammars,
      cognitiveServicesVoice: getCognitiveServicesVoice(),
      speechToken,
      webSpeechGrammars
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
        <a href="https://github.com/compulim/web-speech-cognitive-services">
          <img
            alt="Fork me on GitHub"
            src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png"
            style={{ position: 'absolute', top: 0, right: 0, border: 0 }}
            target="_blank"
          />
        </a>
        <DictationPane
          className={ DICTATION_PANE_CSS + '' }
          disabled={ !state.ready }
          name="Cognitive Services"
          grammars={ state.cognitiveServicesGrammars }
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
          grammars={ state.webSpeechGrammars }
        />
      </div>
    );
  }
}
