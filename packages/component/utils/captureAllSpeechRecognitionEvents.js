import formatEvent from './formatEvent';

const SPEECH_RECOGNITION_EVENTS = [
  'audioend',
  'audiostart',
  'end',
  'error',
  'nomatch',
  'result',
  'soundend',
  'soundstart',
  'speechend',
  'speechstart',
  'start'
];

export default function captureAllSpeechRecognitionEvents(speechRecognition) {
  const events = [];
  const pushEvent = event => events.push(formatEvent(event));

  SPEECH_RECOGNITION_EVENTS.forEach(name => speechRecognition.addEventListener(name, pushEvent));

  return {
    getEvents() {
      return events;
    },

    releaseEvents() {
      SPEECH_RECOGNITION_EVENTS.forEach(name => speechRecognition.removeEventListener(name, pushEvent));
    }
  };
}
