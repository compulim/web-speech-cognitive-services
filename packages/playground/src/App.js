import { css } from 'glamor';
import React from 'react';

import SpeechRecognition, { SpeechGrammarList } from 'component';
import DictationPane from './DictationPane';
import SayPane from './SayPane';

const ROOT_CSS = css({
  display: 'flex'
});

const DICTATION_PANE_CSS = css({
  flex: 1
});

export default () =>
  <div className={ ROOT_CSS }>
    <DictationPane
      className={ DICTATION_PANE_CSS + '' }
      name="Cognitive Services"
      speechGrammarList={ SpeechGrammarList }
      speechRecognition={ SpeechRecognition }
    />
    <DictationPane
      className={ DICTATION_PANE_CSS + '' }
      name="Web Speech API"
    />
    <SayPane />
  </div>
