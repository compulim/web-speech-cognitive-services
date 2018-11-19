import { css } from 'glamor';
import memoize from 'memoize-one';
import React from 'react';

import {
  createSpeechRecognitionPonyfill
} from 'web-speech-cognitive-services/lib/UnifiedSpeech';

import EventHistory from './EventHistory';

const ROOT_CSS = css({
});

const MONITORING_EVENTS = [
  'audiostart',
  'soundstart',
  'speechstart',
  'speechend',
  'soundend',
  'audioend',
  'result',
  'nomatch',
  'error',
  'start',
  'end',
  'cognitiveservices'
];

export default class ProvingGround extends React.Component {
  constructor(props) {
    super(props);

    this.createEventTargets = memoize((browser, cognitiveServices) => {
      const eventTargets = {};

      if (browser) {
        eventTargets.browser = browser;
      }

      if (cognitiveServices) {
        eventTargets.cognitiveServices = cognitiveServices;
      }

      return eventTargets;
    });

    this.handleAbort = this.handleAbort.bind(this);
    this.handleClearHistory = this.handleClearHistory.bind(this);
    this.handleStartBrowserWebSpeech = this.handleStartBrowserWebSpeech.bind(this);
    this.handleStartCognitiveServicesSpeechService = this.handleStartCognitiveServicesSpeechService.bind(this);
    this.handleStartBoth = this.handleStartBoth.bind(this, true);
    this.handleStopBoth = this.handleStopBoth.bind(this, false);
    this.handleStopBrowserWebSpeech = this.handleStopBrowserWebSpeech.bind(this);
    this.handleStopCognitiveServicesSpeechService = this.handleStopCognitiveServicesSpeechService.bind(this);
    this.handleContinuousChange = this.handleContinuousChange.bind(this);

    this.browserPonyfill = {
      SpeechRecognition: window.SpeechRecognition || window.webkitSpeechRecognition
    };

    this.cognitiveServicesPonyfill = createSpeechRecognitionPonyfill();

    this.state = {
      browserSpeechRecognition: null,
      cognitiveServicesSpeechRecognition: null,
      continuous: false,
      historyKey: Math.random()
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.ponyfill !== nextProps.ponyfill) {
      console.warn('"ponyfill" props cannot be changed after mount');
    }
  }

  handleAbort() {
    const { browserSpeechRecognition, cognitiveServicesSpeechRecognition } = this.state;

    browserSpeechRecognition && browserSpeechRecognition.abort();
    cognitiveServicesSpeechRecognition && cognitiveServicesSpeechRecognition.abort();

    this.setState(() => ({
      browserSpeechRecognition: null,
      cognitiveServicesSpeechRecognition: null,
      started: false
    }));
  }

  handleClearHistory() {
    this.setState(() => ({
      historyKey: Math.random()
    }));
  }

  handleContinuousChange({ target: { checked } }) {
    this.setState(() => ({
      continuous: checked
    }));
  }

  handleStartBoth() {
    !this.state.browserSpeechRecognition && this.handleStartBrowserWebSpeech();
    !this.state.cognitiveServicesSpeechRecognition && this.handleStartCognitiveServicesSpeechService();
  }

  handleStartBrowserWebSpeech() {
    const { state: { continuous } } = this;
    const browserSpeechRecognition = new this.browserPonyfill.SpeechRecognition();

    browserSpeechRecognition.continuous = continuous;

    this.setState(() => ({
      browserSpeechRecognition,
      started: true
    }), () => {
      browserSpeechRecognition.start();
    });
  }

  handleStartCognitiveServicesSpeechService() {
    const { state: { continuous } } = this;
    const cognitiveServicesSpeechRecognition = new this.cognitiveServicesPonyfill.SpeechRecognition();

    cognitiveServicesSpeechRecognition.continuous = continuous;

    this.setState(() => ({
      cognitiveServicesSpeechRecognition,
      started: true
    }), () => {
      cognitiveServicesSpeechRecognition.start();
    });
  }

  handleStopBoth() {
    this.state.browserSpeechRecognition && this.handleStopBrowserWebSpeech();
    this.state.cognitiveServicesSpeechRecognition && this.handleStopCognitiveServicesSpeechService();
  }

  handleStopBrowserWebSpeech() {
    const { browserSpeechRecognition } = this.state;

    this.setState(
      () => ({ browserSpeechRecognition: null }),
      () => browserSpeechRecognition.stop()
    );
  }

  handleStopCognitiveServicesSpeechService() {
    const { cognitiveServicesSpeechRecognition } = this.state;

    this.setState(
      () => ({ cognitiveServicesSpeechRecognition: null }),
      () => cognitiveServicesSpeechRecognition.stop()
    );
  }

  render() {
    const {
      state: { browserSpeechRecognition, cognitiveServicesSpeechRecognition, continuous, historyKey }
    } = this;

    const eventTargets = this.createEventTargets(
      browserSpeechRecognition,
      cognitiveServicesSpeechRecognition
    );

    return (
      <div className={ ROOT_CSS }>
        <div className="button-bar">
          <button
            disabled={ !this.browserPonyfill.SpeechRecognition || !!browserSpeechRecognition }
            onClick={ this.handleStartBrowserWebSpeech }
          >
            Start browser
          </button>
          <button
            disabled={ !!cognitiveServicesSpeechRecognition }
            onClick={ this.handleStartCognitiveServicesSpeechService }
          >
            Start Cognitive Services
          </button>
          <button
            disabled={
              (!this.browserPonyfill.SpeechRecognition || !!browserSpeechRecognition)
              && !!this.cognitiveServicesPonyfill
            }
            onClick={ this.handleStartBoth }
          >
            Start both
          </button>
          <button
            disabled={ !browserSpeechRecognition }
            onClick={ this.handleStopBrowserWebSpeech }
          >
            Stop browser
          </button>
          <button
            disabled={ !cognitiveServicesSpeechRecognition }
            onClick={ this.handleStopCognitiveServicesSpeechService }
          >
            Stop Cognitive Services
          </button>
          <button
            disabled={ !browserSpeechRecognition && !cognitiveServicesSpeechRecognition }
            onClick={ this.handleStopBoth }
          >
            Stop both
          </button>
          <button
            disabled={ true }
            onClick={ this.handleAbort }
          >
            Abort
          </button>
          <button
            onClick={ this.handleClearHistory }
          >
            Clear history
          </button>
          <label>
            <input
              onChange={ this.handleContinuousChange }
              type="checkbox"
              value={ continuous }
            />
            Continuous mode
          </label>
        </div>
        <div className="grounds">
          <EventHistory
            events={ MONITORING_EVENTS }
            key={ historyKey }
            targets={ eventTargets }
          />
        </div>
      </div>
    );
  }
}
