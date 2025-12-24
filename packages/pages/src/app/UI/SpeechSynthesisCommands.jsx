import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback } from 'react';

import cancelSpeechSynthesis from '../data/actions/cancelSpeechSynthesis.ts';
import clearSpeechSynthesisUtterance from '../data/actions/clearSpeechSynthesisUtterance.ts';
import pauseSpeechSynthesisUtterance from '../data/actions/pauseSpeechSynthesis.ts';
import resumeSpeechSynthesisUtterance from '../data/actions/resumeSpeechSynthesis.ts';
import speechSynthesisSpeakUtterance from '../data/actions/speechSynthesisSpeakUtterance.ts';

import SpeechSynthesisSpeakingProperty from './SpeechSynthesisSpeakingProperty.jsx';

const SpeechSynthesisCommands = () => {
  const { hasUtterances, text, voiceURI } = useSelector(
    ({ speechSynthesisUtterances, speechSynthesisText, speechSynthesisVoiceURI }) => ({
      hasUtterances: speechSynthesisUtterances.length,
      text: speechSynthesisText,
      voiceURI: speechSynthesisVoiceURI
    })
  );

  const dispatch = useDispatch();
  const dispatchCancelSpeechSynthesis = useCallback(() => dispatch(cancelSpeechSynthesis()), [dispatch]);
  const dispatchClearSpeechSynthesisUtterance = useCallback(
    () => dispatch(clearSpeechSynthesisUtterance()),
    [dispatch]
  );

  const dispatchPauseSpeechSynthesisUtterance = useCallback(
    () => dispatch(pauseSpeechSynthesisUtterance()),
    [dispatch]
  );

  const dispatchResumeSpeechSynthesisUtterance = useCallback(
    () => dispatch(resumeSpeechSynthesisUtterance()),
    [dispatch]
  );

  const dispatchSpeechSynthesisSpeakUtterance = useCallback(
    () => dispatch(speechSynthesisSpeakUtterance({ text, voiceURI })),
    [dispatch, text, voiceURI]
  );

  return (
    <div>
      <button
        className="btn btn-primary"
        disabled={!text}
        onClick={dispatchSpeechSynthesisSpeakUtterance}
        type="button"
      >
        Speak
      </button>
      &nbsp;
      <div aria-label="Pause or resume" className="btn-group" role="group">
        <button
          className="btn btn-primary"
          disabled={!text}
          onClick={dispatchPauseSpeechSynthesisUtterance}
          type="button"
        >
          Pause
        </button>
        <button
          className="btn btn-primary"
          disabled={!text}
          onClick={dispatchResumeSpeechSynthesisUtterance}
          type="button"
        >
          Resume
        </button>
      </div>
      &nbsp;
      <button className="btn btn-primary" disabled={!text} onClick={dispatchCancelSpeechSynthesis} type="button">
        Cancel
      </button>
      &nbsp;
      <button
        className="btn btn-danger"
        disabled={!hasUtterances}
        onClick={dispatchClearSpeechSynthesisUtterance}
        type="button"
      >
        Clear utterances
      </button>
      &nbsp;
      <SpeechSynthesisSpeakingProperty />
    </div>
  );
};

export default SpeechSynthesisCommands;
