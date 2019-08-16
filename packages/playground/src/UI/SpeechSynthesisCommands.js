import { useSelector } from 'react-redux';
import React from 'react';
import useDispatchAction from '../useDispatchAction';

import cancelSpeechSynthesis from '../data/actions/cancelSpeechSynthesis';
import clearSpeechSynthesisUtterance from '../data/actions/clearSpeechSynthesisUtterance';
import pauseSpeechSynthesisUtterance from '../data/actions/pauseSpeechSynthesis';
import resumeSpeechSynthesisUtterance from '../data/actions/resumeSpeechSynthesis';
import speechSynthesisSpeakUtterance from '../data/actions/speechSynthesisSpeakUtterance';

import SpeechSynthesisSpeakingProperty from './SpeechSynthesisSpeakingProperty';

const SpeechSynthesisCommands = () => {
  const { hasUtterances, text, voiceURI } = useSelector(({
    speechSynthesisUtterances,
    speechSynthesisText,
    speechSynthesisVoiceURI
  }) => ({
    hasUtterances: speechSynthesisUtterances.length,
    text: speechSynthesisText,
    voiceURI: speechSynthesisVoiceURI
  }));

  const dispatchCancelSpeechSynthesis = useDispatchAction(cancelSpeechSynthesis);
  const dispatchClearSpeechSynthesisUtterance = useDispatchAction(clearSpeechSynthesisUtterance);
  const dispatchPauseSpeechSynthesisUtterance = useDispatchAction(pauseSpeechSynthesisUtterance);
  const dispatchResumeSpeechSynthesisUtterance = useDispatchAction(resumeSpeechSynthesisUtterance);
  const dispatchSpeechSynthesisSpeakUtterance = useDispatchAction(() => speechSynthesisSpeakUtterance({
    text, voiceURI
  }), [text, voiceURI])

  return (
    <div>
      <button
        className="btn btn-primary"
        disabled={ !text }
        onClick={ dispatchSpeechSynthesisSpeakUtterance }
        type="button"
      >Speak</button>
      &nbsp;
      <div
        aria-label="Pause or resume"
        className="btn-group"
        role="group"
      >
        <button
          className="btn btn-primary"
          disabled={ !text }
          onClick={ dispatchPauseSpeechSynthesisUtterance }
          type="button"
        >Pause</button>
        <button
          className="btn btn-primary"
          disabled={ !text }
          onClick={ dispatchResumeSpeechSynthesisUtterance }
          type="button"
        >Resume</button>
      </div>
      &nbsp;
      <button
        className="btn btn-primary"
        disabled={ !text }
        onClick={ dispatchCancelSpeechSynthesis }
        type="button"
      >Cancel</button>
      &nbsp;
      <button
        className="btn btn-danger"
        disabled={ !hasUtterances }
        onClick={ dispatchClearSpeechSynthesisUtterance }
        type="button"
      >Clear utterances</button>
      &nbsp;
      <SpeechSynthesisSpeakingProperty />
    </div>
  );
}

export default SpeechSynthesisCommands
