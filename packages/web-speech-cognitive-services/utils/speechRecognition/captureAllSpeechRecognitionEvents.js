import formatSpeechRecognitionEvent from './formatSpeechRecognitionEvent';

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

export default async function captureAllSpeechRecognitionEvents(speechRecognition, fn) {
  const events = [];
  const pushEvent = event => events.push(formatSpeechRecognitionEvent(event));

  try {
    SPEECH_RECOGNITION_EVENTS.forEach(name => speechRecognition.addEventListener(name, pushEvent));

    await fn();

    return events;
  } finally {
    SPEECH_RECOGNITION_EVENTS.forEach(name => speechRecognition.removeEventListener(name, pushEvent));
  }
}
