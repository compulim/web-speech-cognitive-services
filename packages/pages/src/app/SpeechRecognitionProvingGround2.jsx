import React from 'react';

import SpeechRecognitionCommands from './UI/SpeechRecognitionCommands.jsx';
import SpeechRecognitionEvents from './UI/SpeechRecognitionSimpleEvents.jsx';

export default function SpeechRecognitionProvingGround2() {
  return (
    <div>
      <div className="row">
        <div className="col">
          <SpeechRecognitionCommands />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <SpeechRecognitionEvents />
        </div>
      </div>
    </div>
  );
}
