import { css } from 'glamor';
import React from 'react';

import GitHubForkMe from './GitHubForkMe';
import SpeechRecognitionProvingGround from './SpeechRecognitionProvingGround';

import {
  createSpeechRecognitionPonyfill
} from 'web-speech-cognitive-services/lib/UnifiedSpeech';

const ROOT_CSS = css({
  display: 'flex',
  flex: 1,

  '& > .proving-grounds': {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',

    '& > *': {
      flex: 1
    }
  }
});

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      browserPonyfill: {
        SpeechRecognition: window.SpeechRecognition
      },
      cognitiveServicesPonyfill: createSpeechRecognitionPonyfill()
    };
  }

  render() {
    const {
      state: {
        browserPonyfill,
        cognitiveServicesPonyfill
      }
    } = this;

    return (
      <div className={ ROOT_CSS }>
        <div className="proving-grounds">
          <SpeechRecognitionProvingGround />
        </div>
        <GitHubForkMe owner="compulim" repo="web-speech-cognitive-services" />
      </div>
    );
  }
}
