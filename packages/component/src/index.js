import createSpeechRecognitionPonyfill from './SpeechToText';
import createSpeechSynthesisPonyfill from './TextToSpeech';

export default async function (...args) {
  return {
    ...(await createSpeechRecognitionPonyfill(...args)),
    ...(await createSpeechSynthesisPonyfill(...args))
  };
};

export {
  createSpeechRecognitionPonyfill,
  createSpeechSynthesisPonyfill
}
