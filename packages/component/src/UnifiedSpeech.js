import createSpeechRecognitionPonyfill from './UnifiedSpeech/SpeechToText/createSpeechRecognitionPonyfill';

export default async function (...args) {
  return {
    ...(await createSpeechRecognitionPonyfill(...args))
  };
};

export {
  createSpeechRecognitionPonyfill
}
