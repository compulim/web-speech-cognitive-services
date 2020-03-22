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

  SPEECH_RECOGNITION_EVENTS.forEach(name => speechRecognition.addEventListener(name, pushEvent));

  await fn();

  SPEECH_RECOGNITION_EVENTS.forEach(name => speechRecognition.removeEventListener(name, pushEvent));

  return events;
}
