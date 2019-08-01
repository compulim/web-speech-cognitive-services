import { connect } from 'react-redux';
import React, { useMemo, useState } from 'react';

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
import setSpeechRecognitionPhrases from '../data/actions/setSpeechRecognitionPhrases';
import setSpeechRecognitionReferenceGrammars from '../data/actions/setSpeechRecognitionReferenceGrammars';

const SpeechRecognitionCommands = ({
  abortSpeechRecognition,
  clearSpeechRecognitionEvent,
  continuous,
  empty,
  interimResults,
  maxAlternatives,
  phrases: committedPhrases,
  ponyfillType,
  referenceGrammars: committedReferenceGrammars,
  setSpeechRecognitionContinuous,
  setSpeechRecognitionHideInterimResults,
  setSpeechRecognitionInteractive,
  setSpeechRecognitionMaxAlternatives,
  setSpeechRecognitionPhrases,
  setSpeechRecognitionReferenceGrammars,
  setSpeechRecognitionShowInterimResults,
  started,
  startSpeechRecognition,
  stopSpeechRecognition
}) => {
  const [phrasesString, setPhrasesString] = useState();
  const [referenceGrammarsString, setReferenceGrammarsString] = useState();

  useMemo(() => setPhrasesString(committedPhrases.join(', ')), [committedPhrases]);
  useMemo(() => setReferenceGrammarsString(committedReferenceGrammars.join(', ')), [committedReferenceGrammars]);

  return (
    <React.Fragment>
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
            disabled={ started || (ponyfillType !== 'browser' && ponyfillType !== 'speechservices') }
            onChange={ setSpeechRecognitionMaxAlternatives }
            value={ (ponyfillType === 'browser' || ponyfillType === 'speechservices') ? maxAlternatives : 1 }
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
      <div className="row" style={{ marginBottom: '1em' }}>
        <div className="col">
          <label>Phrases</label>
          <input
            aria-label="Phrases for recognition"
            className="form-control"
            disabled={ started || (ponyfillType !== 'browser' && ponyfillType !== 'speechservices') }
            onBlur={ () => setSpeechRecognitionPhrases(phrasesString.split(/[,;|]/gu).map(value => value.trim()).filter(value => value)) }
            onChange={ ({ target: { value } }) => setPhrasesString(value) }
            type="text"
            value={ phrasesString }
          />
        </div>
        <div className="col">
          <label>Reference grammars</label>
          <input
            aria-label="Reference grammars for recognition"
            className="form-control"
            disabled={ started || (ponyfillType !== 'browser' && ponyfillType !== 'speechservices') }
            onBlur={ () => setSpeechRecognitionReferenceGrammars(referenceGrammarsString.split(/[,;|]/gu).map(value => value.trim()).filter(value => value)) }
            onChange={ ({ target: { value } }) => setReferenceGrammarsString(value) }
            type="text"
            value={ referenceGrammarsString }
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default connect(
  ({
    ponyfillType,
    speechRecognitionEvents,
    speechRecognitionContinuous,
    speechRecognitionInterimResults,
    speechRecognitionMaxAlternatives,
    speechRecognitionPhrases,
    speechRecognitionReferenceGrammars,
    speechRecognitionStarted
  }) => ({
    empty: !speechRecognitionEvents.length,
    continuous: speechRecognitionContinuous,
    interimResults: speechRecognitionInterimResults,
    maxAlternatives: speechRecognitionMaxAlternatives,
    phrases: speechRecognitionPhrases,
    ponyfillType,
    referenceGrammars: speechRecognitionReferenceGrammars,
    started: speechRecognitionStarted
  }),
  {
    abortSpeechRecognition,
    clearSpeechRecognitionEvent,
    setSpeechRecognitionContinuous: () => setSpeechRecognitionContinuous(true),
    setSpeechRecognitionHideInterimResults: () => setSpeechRecognitionInterimResults(false),
    setSpeechRecognitionInteractive: () => setSpeechRecognitionContinuous(false),
    setSpeechRecognitionMaxAlternatives: value => setSpeechRecognitionMaxAlternatives(+value),
    setSpeechRecognitionPhrases: phrases => setSpeechRecognitionPhrases(phrases),
    setSpeechRecognitionReferenceGrammars: referenceGrammars => setSpeechRecognitionReferenceGrammars(referenceGrammars),
    setSpeechRecognitionShowInterimResults: () => setSpeechRecognitionInterimResults(true),
    startSpeechRecognition,
    stopSpeechRecognition
  }
)(SpeechRecognitionCommands)
