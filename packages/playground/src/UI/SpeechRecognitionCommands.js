import { connect } from 'react-redux';
import React from 'react';

import Select, { Option } from '../Bootstrap/Select';
import SpeechRecognitionLanguageSelector from './SpeechRecognitionLanguageSelector';
import SpeechRecognitionTextNormalizationSelector from './SpeechRecognitionTextNormalizationSelector';

import abortSpeechRecognition from '../data/actions/abortSpeechRecognition';
import startSpeechRecognition from '../data/actions/startSpeechRecognition';
import stopSpeechRecognition from '../data/actions/stopSpeechRecognition';

import clearSpeechRecognitionEvent from '../data/actions/clearSpeechRecognitionEvent';
import setSpeechRecognitionContinuous from '../data/actions/setSpeechRecognitionContinuous';
import setSpeechRecognitionInterimResults from '../data/actions/setSpeechRecognitionInterimResults';
import setSpeechRecognitionMaxAlternatives from '../data/actions/setSpeechRecognitionMaxAlternatives';

const SpeechRecognitionCommands = ({
  abortSpeechRecognition,
  clearSpeechRecognitionEvent,
  continuous,
  empty,
  interimResults,
  maxAlternatives,
  ponyfillType,
  setSpeechRecognitionContinuous,
  setSpeechRecognitionHideInterimResults,
  setSpeechRecognitionInteractive,
  setSpeechRecognitionMaxAlternatives,
  setSpeechRecognitionShowInterimResults,
  started,
  startSpeechRecognition,
  stopSpeechRecognition
}) =>
  <div className="row col" style={{ marginBottom: '1em' }}>
    <div className="btn-group">
      <button
        className="btn btn-primary"
        disabled={ !!started }
        onClick={ startSpeechRecognition }
        type="button"
      >
        {
          continuous ?
            interimResults ?
              'Start in continuous mode with interims'
            :
              'Start in continuous mode'
          :
            interimResults ?
              'Start with interims'
            :
              'Start'
        }
      </button>
      <button
        className="btn btn-primary dropdown-toggle dropdown-toggle-split"
        data-toggle="dropdown"
        disabled={ !!started }
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span className="sr-only">Toggle dropdown</span>
      </button>
      <div className="dropdown-menu">
        <button
          className="dropdown-item"
          onClick={ setSpeechRecognitionInteractive }
          type="button"
        >Interactive mode</button>
        <button
          className="dropdown-item"
          onClick={ setSpeechRecognitionContinuous }
          type="button"
        >Continuous mode</button>
        <div className="dropdown-divider" />
        <button
          className="dropdown-item"
          onClick={ setSpeechRecognitionShowInterimResults }
          type="button"
        >Show interims</button>
        <button
          className="dropdown-item"
          onClick={ setSpeechRecognitionHideInterimResults }
          type="button"
        >Hide interims</button>
      </div>
    </div>
    &nbsp;
    <div className="form-group-inline">
      <Select
        disabled={ started || ponyfillType !== 'browser' }
        onChange={ setSpeechRecognitionMaxAlternatives }
        value={ ponyfillType === 'browser' ? maxAlternatives : 1 }
      >
        <Option text="One alternative" value="1" />
        <Option text="3 alternatives" value="3" />
        <Option text="5 alternatives" value="5" />
        <Option text="10 alternatives" value="10" />
      </Select>
    </div>
    &nbsp;
    <div className="form-group-inline">
      <SpeechRecognitionLanguageSelector />
    </div>
    &nbsp;
    <div className="form-group-inline">
      <SpeechRecognitionTextNormalizationSelector />
    </div>
    &nbsp;
    <div className="btn-group">
      <button
        className="btn btn-secondary"
        disabled={ !started }
        onClick={ stopSpeechRecognition }
        type="button"
      >Stop</button>
      <button
        className="btn btn-secondary"
        disabled={ !started }
        onClick={ abortSpeechRecognition }
        type="button"
      >Abort</button>
    </div>
    &nbsp;
    <button
      className="btn btn-danger"
      disabled={ empty }
      onClick={ clearSpeechRecognitionEvent }
      type="button"
    >Clear events</button>
  </div>

export default connect(
  ({
    ponyfillType,
    speechRecognitionEvents,
    speechRecognitionContinuous,
    speechRecognitionInterimResults,
    speechRecognitionMaxAlternatives,
    speechRecognitionStarted
  }) => ({
    empty: !speechRecognitionEvents.length,
    continuous: speechRecognitionContinuous,
    interimResults: speechRecognitionInterimResults,
    maxAlternatives: speechRecognitionMaxAlternatives,
    ponyfillType,
    started: speechRecognitionStarted
  }),
  {
    abortSpeechRecognition,
    clearSpeechRecognitionEvent,
    setSpeechRecognitionContinuous: () => setSpeechRecognitionContinuous(true),
    setSpeechRecognitionHideInterimResults: () => setSpeechRecognitionInterimResults(false),
    setSpeechRecognitionInteractive: () => setSpeechRecognitionContinuous(false),
    setSpeechRecognitionMaxAlternatives: value => setSpeechRecognitionMaxAlternatives(+value),
    setSpeechRecognitionShowInterimResults: () => setSpeechRecognitionInterimResults(true),
    startSpeechRecognition,
    stopSpeechRecognition
  }
)(SpeechRecognitionCommands)
