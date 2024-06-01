/* global process */

import createSpeechRecognitionPonyfill, {
  createSpeechRecognitionPonyfillFromRecognizer
} from './SpeechServices/SpeechToText';
import createSpeechSynthesisPonyfill from './SpeechServices/TextToSpeech';
import fetchAuthorizationToken from './SpeechServices/fetchAuthorizationToken';

export default function createSpeechServicesPonyfill(options = {}, ...args) {
  return {
    ...createSpeechRecognitionPonyfill(options, ...args),
    ...createSpeechSynthesisPonyfill(options, ...args)
  };
}

export {
  createSpeechRecognitionPonyfill,
  createSpeechRecognitionPonyfillFromRecognizer,
  createSpeechSynthesisPonyfill,
  fetchAuthorizationToken
};

const meta = document.createElement('meta');

meta.setAttribute('name', 'web-speech-cognitive-services');
meta.setAttribute('content', `version=${ process.env.npm_package_version }`);

document.head.appendChild(meta);
