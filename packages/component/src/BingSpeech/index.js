import createSpeechRecognitionPonyfill from './SpeechToText/createSpeechRecognitionPonyfill';
import createSpeechSynthesisPonyfill from './TextToSpeech/createSpeechSynthesisPonyfill';
import fetchAuthorizationToken from './Util/fetchAuthorizationToken';

export default async function (...args) {
  return await {
    ...(await createSpeechRecognitionPonyfill(...args)),
    ...(await createSpeechSynthesisPonyfill(...args))
  };
}

export {
  createSpeechRecognitionPonyfill,
  createSpeechSynthesisPonyfill,
  fetchAuthorizationToken
}
