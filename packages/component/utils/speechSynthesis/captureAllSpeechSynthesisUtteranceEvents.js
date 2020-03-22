import formatSpeechSynthesisUtteranceEvent from './formatSpeechSynthesisUtteranceEvent';

const SPEECH_SYNTHESIS_UTTERANCE_EVENTS = [
  'boundary',
  'end',
  'error',
  'mark',
  'pause',
  'resume',
  'start'
];

export default async function captureAllSpeechSynthesisUtteranceEvents(speechSynthesisUtterance, fn) {
  const events = [];
  const pushEvent = event => events.push(formatSpeechSynthesisUtteranceEvent(event));

  SPEECH_SYNTHESIS_UTTERANCE_EVENTS.forEach(name => speechSynthesisUtterance.addEventListener(name, pushEvent));

  await fn();

  SPEECH_SYNTHESIS_UTTERANCE_EVENTS.forEach(name => speechSynthesisUtterance.removeEventListener(name, pushEvent));

  return events;
}
