import createSpeechRecognitionPonyfill from './SpeechToText';
import createSpeechSynthesisPonyfill from './TextToSpeech';
import fetchAuthorizationToken from './fetchAuthorizationToken';

export default async function (...args) {
  return {
    ...(await createSpeechRecognitionPonyfill(...args)),
    ...(await createSpeechSynthesisPonyfill(...args))
  };
};

export {
  createSpeechRecognitionPonyfill,
  createSpeechSynthesisPonyfill,
  fetchAuthorizationToken
}
