import React from 'react';

import SpeechRecognitionCommands from './UI/SpeechRecognitionCommands';
import SpeechRecognitionEvents from './UI/SpeechRecognitionSimpleEvents';

export default () => (
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
