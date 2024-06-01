import { useSelector } from 'react-redux';
import React from 'react';

import SpeechSynthesisUtteranceEvents from './SpeechSynthesisUtteranceEvents';

const SpeechSynthesisUtterances = () => {
  const speechSynthesisUtterances = useSelector(({ speechSynthesisUtterances }) => speechSynthesisUtterances);

  return (
    <div className="list-group">
      {speechSynthesisUtterances.map(utterance => (
        <div className="list-group-item" key={utterance.id}>
          <div>{utterance.text}</div>
          <SpeechSynthesisUtteranceEvents utteranceID={utterance.id} />
        </div>
      ))}
      <br />
    </div>
  );
};

export default SpeechSynthesisUtterances;
