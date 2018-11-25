import createSpeechRecognitionPonyfill from './SpeechToText';

export default async function (...args) {
  return {
    ...(await createSpeechRecognitionPonyfill(...args))
  };
};

export {
  createSpeechRecognitionPonyfill
}
