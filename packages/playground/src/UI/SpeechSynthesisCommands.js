import { connect } from 'react-redux';
import React from 'react';

import cancelSpeechSynthesis from '../data/actions/cancelSpeechSynthesis';
import clearSpeechSynthesisUtterance from '../data/actions/clearSpeechSynthesisUtterance';
import pauseSpeechSynthesisUtterance from '../data/actions/pauseSpeechSynthesis';
import resumeSpeechSynthesisUtterance from '../data/actions/resumeSpeechSynthesis';
import speechSynthesisSpeakUtterance from '../data/actions/speechSynthesisSpeakUtterance';

import SpeechSynthesisSpeakingProperty from './SpeechSynthesisSpeakingProperty';

const SpeechSynthesisCommands = ({
  cancelSpeechSynthesis,
  clearSpeechSynthesisUtterance,
  hasUtterances,
  pauseSpeechSynthesisUtterance,
  resumeSpeechSynthesisUtterance,
  speechSynthesisSpeakUtterance,
  text
}) =>
  <div>
    <button
      className="btn btn-primary"
      disabled={ !text }
      onClick={ speechSynthesisSpeakUtterance }
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
        onClick={ pauseSpeechSynthesisUtterance }
        type="button"
      >Pause</button>
      <button
        className="btn btn-primary"
        disabled={ !text }
        onClick={ resumeSpeechSynthesisUtterance }
        type="button"
      >Resume</button>
    </div>
    &nbsp;
    <button
      className="btn btn-primary"
      disabled={ !text }
      onClick={ cancelSpeechSynthesis }
      type="button"
    >Cancel</button>
    &nbsp;
    <button
      className="btn btn-danger"
      disabled={ !hasUtterances }
      onClick={ clearSpeechSynthesisUtterance }
      type="button"
    >Clear utterances</button>
    &nbsp;
    <SpeechSynthesisSpeakingProperty />
  </div>

export default connect(
  ({
    speechSynthesisUtterances,
    speechSynthesisText,
    speechSynthesisVoiceURI
  }) => ({
    hasUtterances: speechSynthesisUtterances.length,
    text: speechSynthesisText,
    voiceURI: speechSynthesisVoiceURI
  }),
  {
    cancelSpeechSynthesis,
    clearSpeechSynthesisUtterance,
    pauseSpeechSynthesisUtterance,
    resumeSpeechSynthesisUtterance,
    speechSynthesisSpeakUtterance
  },
  (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    speechSynthesisSpeakUtterance: () => dispatchProps.speechSynthesisSpeakUtterance({
      text: stateProps.text,
      voiceURI: stateProps.voiceURI
    })
  })
)(SpeechSynthesisCommands)
