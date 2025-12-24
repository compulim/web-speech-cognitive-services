import EventListenerMap from './private/EventListenerMap.ts';
import type SpeechRecognitionErrorEvent from './SpeechRecognitionErrorEvent';
import type SpeechRecognitionEvent from './SpeechRecognitionEvent';

export type SpeechRecognitionEventListenerMap = EventListenerMap<
  | 'audioend'
  | 'audiostart'
  | 'cognitiveservices'
  | 'end'
  | 'error'
  | 'result'
  | 'soundend'
  | 'soundstart'
  | 'speechend'
  | 'speechstart'
  | 'start',
  {
    audioend: SpeechRecognitionEvent<'audioend'>;
    audiostart: SpeechRecognitionEvent<'audiostart'>;
    cognitiveservices: SpeechRecognitionEvent<'cognitiveservices'>;
    end: SpeechRecognitionEvent<'end'>;
    error: SpeechRecognitionErrorEvent;
    result: SpeechRecognitionEvent<'result'>;
    soundend: SpeechRecognitionEvent<'soundend'>;
    soundstart: SpeechRecognitionEvent<'soundstart'>;
    speechend: SpeechRecognitionEvent<'speechend'>;
    speechstart: SpeechRecognitionEvent<'speechstart'>;
    start: SpeechRecognitionEvent<'start'>;
  }
>;
