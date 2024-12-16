import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Select, { Option } from '../Bootstrap/Select';
import SpeechRecognitionEndpointIdInput from './SpeechRecognitionEndpointIdInput';
import SpeechRecognitionInitialSilenceTimeoutSelector from './SpeechRecognitionInitialSilenceTimeoutSelector';
import SpeechRecognitionLanguageSelector from './SpeechRecognitionLanguageSelector';
import SpeechRecognitionTextNormalizationSelector from './SpeechRecognitionTextNormalizationSelector';

import abortSpeechRecognition from '../data/actions/abortSpeechRecognition';
import clearSpeechRecognitionEvent from '../data/actions/clearSpeechRecognitionEvent';
import setSpeechRecognitionContinuous from '../data/actions/setSpeechRecognitionContinuous';
import setSpeechRecognitionDelayedStart from '../data/actions/setSpeechRecognitionDelayedStart';
import setSpeechRecognitionInterimResults from '../data/actions/setSpeechRecognitionInterimResults';
import setSpeechRecognitionMaxAlternatives from '../data/actions/setSpeechRecognitionMaxAlternatives';
import setSpeechRecognitionPhrases from '../data/actions/setSpeechRecognitionPhrases';
import setSpeechRecognitionReferenceGrammars from '../data/actions/setSpeechRecognitionReferenceGrammars';
import startSpeechRecognition from '../data/actions/startSpeechRecognition';
import stopSpeechRecognition from '../data/actions/stopSpeechRecognition';
import getPonyfillCapabilities from '../getPonyfillCapabilities';

const SpeechRecognitionCommands = () => {
  const {
    continuous,
    delayedStart,
    empty,
    interimResults,
    maxAlternatives,
    phrases,
    ponyfillType,
    referenceGrammars,
    started
  } = useSelector(
    ({
      ponyfillType,
      speechRecognitionEvents,
      speechRecognitionContinuous,
      speechRecognitionDelayedStart,
      speechRecognitionInterimResults,
      speechRecognitionMaxAlternatives,
      speechRecognitionPhrases,
      speechRecognitionReferenceGrammars,
      speechRecognitionStarted
    }) => ({
      continuous: speechRecognitionContinuous,
      delayedStart: !!speechRecognitionDelayedStart,
      empty: !speechRecognitionEvents.length,
      interimResults: speechRecognitionInterimResults,
      maxAlternatives: speechRecognitionMaxAlternatives,
      phrases: speechRecognitionPhrases,
      ponyfillType,
      referenceGrammars: speechRecognitionReferenceGrammars,
      started: speechRecognitionStarted
    })
  );

  const dispatch = useDispatch();
  const dispatchAbortSpeechRecognition = useCallback(() => dispatch(abortSpeechRecognition()), [dispatch]);
  const dispatchClearSpeechRecognitionEvent = useCallback(() => dispatch(clearSpeechRecognitionEvent()), [dispatch]);
  const dispatchSetSpeechRecognitionContinuous = useCallback(() => dispatch(setSpeechRecognitionContinuous(true)), [
    dispatch
  ]);
  const dispatchSetSpeechRecognitionDelayedStart = useCallback(() => dispatch(setSpeechRecognitionDelayedStart(true)), [
    dispatch
  ]);
  const dispatchSetSpeechRecognitionHideInterimResults = useCallback(
    () => dispatch(setSpeechRecognitionInterimResults(false)),
    [dispatch]
  );
  const dispatchSetSpeechRecognitionInteractive = useCallback(() => dispatch(setSpeechRecognitionContinuous(false)), [
    dispatch
  ]);
  const dispatchSetSpeechRecognitionMaxAlternatives = useCallback(
    value => dispatch(setSpeechRecognitionMaxAlternatives(+value)),
    [dispatch]
  );
  const dispatchSetSpeechRecognitionNoDelayedStart = useCallback(
    () => dispatch(setSpeechRecognitionDelayedStart(false)),
    [dispatch]
  );
  const dispatchSetSpeechRecognitionPhrases = useCallback(value => dispatch(setSpeechRecognitionPhrases(value)), [
    dispatch
  ]);
  const dispatchSetSpeechRecognitionReferenceGrammars = useCallback(
    value => dispatch(setSpeechRecognitionReferenceGrammars(value)),
    [dispatch]
  );
  const dispatchSetSpeechRecognitionShowInterimResults = useCallback(
    () => dispatch(setSpeechRecognitionInterimResults(true)),
    [dispatch]
  );
  const dispatchStartSpeechRecognition = useCallback(() => dispatch(startSpeechRecognition()), [dispatch]);
  const dispatchStopSpeechRecognition = useCallback(() => dispatch(stopSpeechRecognition()), [dispatch]);

  const [phrasesString, setPhrasesString] = useState();
  const [referenceGrammarsString, setReferenceGrammarsString] = useState();

  useMemo(() => setPhrasesString(phrases.join(', ')), [phrases]);
  useMemo(() => setReferenceGrammarsString(referenceGrammars.join(', ')), [referenceGrammars]);

  const ponyfillCapabilities = getPonyfillCapabilities(ponyfillType);

  return (
    <React.Fragment>
      <div className="row col" style={{ marginBottom: '1em' }}>
        <div className="btn-group">
          <button
            className="btn btn-primary"
            disabled={!!started}
            onClick={dispatchStartSpeechRecognition}
            type="button"
          >
            {continuous
              ? interimResults
                ? delayedStart
                  ? 'Delayed start in continuous mode with interims'
                  : 'Start in continuous mode with interims'
                : delayedStart
                ? 'Delayed start in continuous mode'
                : 'Start in continuous mode'
              : interimResults
              ? delayedStart
                ? 'Delayed start with interims'
                : 'Start with interims'
              : delayedStart
              ? 'Delayed start'
              : 'Start'}
          </button>
          <button
            className="btn btn-primary dropdown-toggle dropdown-toggle-split"
            data-toggle="dropdown"
            disabled={!!started}
            aria-haspopup="true"
            aria-expanded="false"
          >
            <span className="sr-only">Toggle dropdown</span>
          </button>
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={dispatchSetSpeechRecognitionInteractive} type="button">
              Interactive mode
            </button>
            <button className="dropdown-item" onClick={dispatchSetSpeechRecognitionContinuous} type="button">
              Continuous mode
            </button>
            <div className="dropdown-divider" />
            <button className="dropdown-item" onClick={dispatchSetSpeechRecognitionShowInterimResults} type="button">
              Show interims
            </button>
            <button className="dropdown-item" onClick={dispatchSetSpeechRecognitionHideInterimResults} type="button">
              Hide interims
            </button>
            <div className="dropdown-divider" />
            <button className="dropdown-item" onClick={dispatchSetSpeechRecognitionDelayedStart} type="button">
              Delayed start
            </button>
            <button className="dropdown-item" onClick={dispatchSetSpeechRecognitionNoDelayedStart} type="button">
              No delayed start
            </button>
          </div>
        </div>
        &nbsp;
        <div className="form-group-inline">
          <Select
            disabled={started || !ponyfillCapabilities.maxAlternatives}
            onChange={dispatchSetSpeechRecognitionMaxAlternatives}
            value={ponyfillCapabilities.maxAlternatives ? maxAlternatives : 1}
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
        <div className="form-group-inline">
          <SpeechRecognitionInitialSilenceTimeoutSelector />
        </div>
        &nbsp;
        <div className="btn-group">
          <button
            className="btn btn-secondary"
            disabled={!started}
            onClick={dispatchStopSpeechRecognition}
            type="button"
          >
            Stop
          </button>
          <button
            className="btn btn-secondary"
            disabled={!started}
            onClick={dispatchAbortSpeechRecognition}
            type="button"
          >
            Abort
          </button>
        </div>
        &nbsp;
        <button className="btn btn-danger" disabled={empty} onClick={dispatchClearSpeechRecognitionEvent} type="button">
          Clear events
        </button>
      </div>
      <div className="row" style={{ marginBottom: '1em' }}>
        <div className="col">
          <label>Phrases</label>
          <input
            aria-label="Phrases for recognition"
            className="form-control"
            disabled={started || !ponyfillCapabilities.dynamicPhrases}
            onBlur={() =>
              dispatchSetSpeechRecognitionPhrases(
                phrasesString
                  .split(/[,;|]/gu)
                  .map(value => value.trim())
                  .filter(value => value)
              )
            }
            onChange={({ target: { value } }) => setPhrasesString(value)}
            type="text"
            value={phrasesString}
          />
        </div>
        <div className="col">
          <label>Reference grammars</label>
          <input
            aria-label="Reference grammars for recognition"
            className="form-control"
            disabled={started || !ponyfillCapabilities.referenceGrammarId}
            onBlur={() =>
              dispatchSetSpeechRecognitionReferenceGrammars(
                referenceGrammarsString
                  .split(/[,;|]/gu)
                  .map(value => value.trim())
                  .filter(value => value)
              )
            }
            onChange={({ target: { value } }) => setReferenceGrammarsString(value)}
            type="text"
            value={referenceGrammarsString}
          />
        </div>
        <div className="col">
          <label>Endpoint ID</label>
          <SpeechRecognitionEndpointIdInput />
        </div>
      </div>
    </React.Fragment>
  );
};

export default SpeechRecognitionCommands;
