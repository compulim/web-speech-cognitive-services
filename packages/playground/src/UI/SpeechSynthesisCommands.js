import { connect } from 'react-redux';
import React from 'react';

const SpeechSynthesisCommands = ({
  hasText
}) =>
  <div>
    <button
      className="btn btn-primary"
      disabled={ !hasText }
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
        disabled={ !hasText }
        type="button"
      >Pause</button>
      <button
        className="btn btn-primary"
        disabled={ !hasText }
        type="button"
      >Resume</button>
    </div>
    &nbsp;
    <button
      className="btn btn-primary"
      disabled={ !hasText }
      type="button"
    >Cancel</button>
  </div>

export default connect(
  ({
    speechSynthesisText
  }) => ({
    hasText: !!speechSynthesisText
  })
)(SpeechSynthesisCommands)
