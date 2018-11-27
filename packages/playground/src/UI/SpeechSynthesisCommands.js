import { connect } from 'react-redux';
import React from 'react';

import clearSpeechSynthesisUtterance from '../data/actions/clearSpeechSynthesisUtterance';
import speechSynthesisSpeakUtterance from '../data/actions/speechSynthesisSpeakUtterance';

const SpeechSynthesisCommands = ({
  clearSpeechSynthesisUtterance,
  hasUtterances,
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
        type="button"
      >Pause</button>
      <button
        className="btn btn-primary"
        disabled={ !text }
        type="button"
      >Resume</button>
    </div>
    &nbsp;
    <button
      className="btn btn-primary"
      disabled={ !text }
      type="button"
    >Cancel</button>
    &nbsp;
    <button
      className="btn btn-danger"
      disabled={ !hasUtterances }
      onClick={ clearSpeechSynthesisUtterance }
      type="button"
    >Clear utterances</button>
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
    clearSpeechSynthesisUtterance,
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
