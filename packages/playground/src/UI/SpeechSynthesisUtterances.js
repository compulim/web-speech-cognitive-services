import { connect } from 'react-redux';
import React from 'react';

const SpeechSynthesisUtterances = ({
  speechSynthesisUtterances
}) =>
  <ul className="list-group">
    { speechSynthesisUtterances.map((utterance, index) =>
      <li
        className="list-group-item"
        key={ index }
      >{ utterance.text }</li>
    ) }
  </ul>

export default connect(
  ({
    speechSynthesisUtterances
  }) => ({
    speechSynthesisUtterances
  })
)(SpeechSynthesisUtterances)
