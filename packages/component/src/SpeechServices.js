import createSpeechRecognitionPonyfill from './SpeechServices/SpeechToText';
import createSpeechSynthesisPonyfill from './SpeechServices/TextToSpeech';
import fetchAuthorizationToken from './SpeechServices/fetchAuthorizationToken';

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
