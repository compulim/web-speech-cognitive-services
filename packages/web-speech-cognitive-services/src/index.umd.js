import { createSpeechRecognitionPonyfillFromRecognizer, createSpeechServicesPonyfill } from './index.js';

// eslint-disable-next-line no-undef
globalThis.WebSpeechCognitiveServices = {
  create: createSpeechServicesPonyfill,
  createSpeechRecognitionPonyfillFromRecognizer
};
