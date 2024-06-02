import { createSpeechRecognitionPonyfillFromRecognizer, createSpeechServicesPonyfill } from './index';

globalThis.WebSpeechCognitiveServices = {
  create: createSpeechServicesPonyfill,
  createSpeechRecognitionPonyfillFromRecognizer
};
