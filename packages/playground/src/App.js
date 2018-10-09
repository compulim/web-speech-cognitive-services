import { css } from 'glamor';
import React from 'react';

import {
  createFetchTokenUsingSubscriptionKey,
  SpeechGrammarList,
  SpeechRecognition,
  speechSynthesis,
  SpeechSynthesisUtterance
} from 'web-speech-cognitive-services';

import DictationPane from './DictationPane';

const ROOT_CSS = css({
  display: 'flex'
});

const DICTATION_PANE_CSS = css({
  flex: 1
});

const FORK_ME_CSS = css({
  border: 0,
  position: 'absolute',
  right: 0,
  top: 0
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
    const fetchToken = createFetchTokenUsingSubscriptionKey(keyFromSearch || keyFromStorage);

    speechSynthesis.fetchToken = fetchToken;

    const cognitiveServicesGrammars = new SpeechGrammarList();

    cognitiveServicesGrammars.words = ['Tuen Mun', 'Yuen Long'];

    const webSpeechGrammarListClass = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const webSpeechGrammars = webSpeechGrammarListClass && new webSpeechGrammarListClass();

    webSpeechGrammars && webSpeechGrammars.addFromString('#JSGF V1.0; grammar districts; public <district> = tuen mun | yuen long;', 1);

    this.state = {
      cognitiveServicesGrammars,
      cognitiveServicesVoice: getCognitiveServicesVoice(),
      fetchToken,
      webSpeechGrammars
    };
  }

  async componentDidMount() {
    // await this.state.fetchToken();

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
            className={ FORK_ME_CSS }
            src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png"
            target="_blank"
          />
        </a>
        <DictationPane
          className={ DICTATION_PANE_CSS + '' }
          disabled={ !state.ready }
          fetchToken={ state.fetchToken }
          name="Cognitive Services"
          grammars={ state.cognitiveServicesGrammars }
          speechGrammarList={ SpeechGrammarList }
          speechRecognition={ SpeechRecognition }
          speechSynthesis={ speechSynthesis }
          speechSynthesisUtterance={ SpeechSynthesisUtterance }
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
