import createDeferred from 'p-defer-es5';
import formatSpeechSynthesisUtteranceEvent from './formatSpeechSynthesisUtteranceEvent';

const SPEECH_SYNTHESIS_UTTERANCE_EVENTS = ['boundary', 'end', 'error', 'mark', 'pause', 'resume', 'start'];

export default async function captureAllSpeechSynthesisUtteranceEvents(speechSynthesisUtterance, fn) {
  const events = [];
  const pushEvent = event => events.push(formatSpeechSynthesisUtteranceEvent(event));
  const { promise, reject } = createDeferred();
  const handleError = ({ error }) => reject(error);

  try {
    SPEECH_SYNTHESIS_UTTERANCE_EVENTS.forEach(name => speechSynthesisUtterance.addEventListener(name, pushEvent));
    speechSynthesisUtterance.addEventListener('error', handleError);

    await Promise.race([fn(), promise]);

    return events;
  } finally {
    SPEECH_SYNTHESIS_UTTERANCE_EVENTS.forEach(name => speechSynthesisUtterance.removeEventListener(name, pushEvent));
    speechSynthesisUtterance.removeEventListener('error', handleError);
  }
}
