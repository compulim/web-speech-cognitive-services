import { css } from 'glamor';
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

    this.handleAbort = this.handleAbort.bind(this);
    this.handleClearHistory = this.handleClearHistory.bind(this);
    this.handleStart = this.handleStart.bind(this, true);
    this.handleStop = this.handleStop.bind(this, false);
    this.handleContinuousChange = this.handleContinuousChange.bind(this);

    this.browserPonyfill = {
      SpeechRecognition: window.SpeechRecognition || window.webkitSpeechRecognition
    };

    this.cognitiveServicesPonyfill = createSpeechRecognitionPonyfill();

    this.state = {
      browserSpeechRecognition: null,
      cognitiveServicesSpeechRecognition: null,
      continuous: false,
      historyKey: Math.random(),
      started: false
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
      eventTargets: {},
      started: false
    }));
  }

  handleClearHistory() {
    // this.setState(({ historyKey }) => ({
    //   historykey: historyKey + 1
    // }));

    this.setState(() => ({
      historyKey: Math.random()
    }));
  }

  handleContinuousChange({ target: { checked } }) {
    this.setState(() => ({
      continuous: checked
    }));
  }

  handleStart() {
    const { state: { continuous } } = this;
    const browserSpeechRecognition = new this.browserPonyfill.SpeechRecognition();
    const cognitiveServicesSpeechRecognition = new this.cognitiveServicesPonyfill.SpeechRecognition();

    browserSpeechRecognition.continuous = continuous;
    cognitiveServicesSpeechRecognition.continuous = continuous;

    this.setState(() => ({
      browserSpeechRecognition,
      cognitiveServicesSpeechRecognition,
      eventTargets: {
        browser: browserSpeechRecognition,
        cognitiveServices: cognitiveServicesSpeechRecognition
      },
      started: true
    }), () => {
      // browserSpeechRecognition.start();
      cognitiveServicesSpeechRecognition.start();
    });
  }

  handleStop() {
    const { browserSpeechRecognition, cognitiveServicesSpeechRecognition } = this.state;

    browserSpeechRecognition && browserSpeechRecognition.stop();
    cognitiveServicesSpeechRecognition && cognitiveServicesSpeechRecognition.stop();

    this.setState(() => ({
      browserSpeechRecognition: null,
      cognitiveServicesSpeechRecognition: null,
      eventTargets: {},
      started: false
    }));
  }

  render() {
    const {
      state: { continuous, eventTargets, historyKey, started }
    } = this;

    return (
      <div className={ ROOT_CSS }>
        <div className="button-bar">
          <button
            disabled={ started }
            onClick={ this.handleStart }
          >
            Start
          </button>
          <button
            disabled={ !started }
            onClick={ this.handleStop }
          >
            Stop
          </button>
          <button
            disabled={ !started }
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
