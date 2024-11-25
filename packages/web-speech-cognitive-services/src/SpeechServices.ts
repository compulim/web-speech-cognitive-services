/* global process */

import {
  createSpeechRecognitionPonyfill,
  createSpeechRecognitionPonyfillFromRecognizer,
  type SpeechGrammarList,
  type SpeechRecognitionAlternative,
  type SpeechRecognitionErrorEvent,
  type SpeechRecognitionEvent,
  type SpeechRecognitionEventListenerMap,
  type SpeechRecognitionResult,
  type SpeechRecognitionResultList
} from './SpeechServices/SpeechToText';
import createSpeechSynthesisPonyfill from './SpeechServices/TextToSpeech';
import fetchAuthorizationToken from './SpeechServices/fetchAuthorizationToken';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function createSpeechServicesPonyfill(options: any = {}) {
  return {
    ...createSpeechRecognitionPonyfill(options),
    ...createSpeechSynthesisPonyfill(options)
  };
}

export {
  createSpeechRecognitionPonyfill,
  createSpeechRecognitionPonyfillFromRecognizer,
  createSpeechSynthesisPonyfill,
  fetchAuthorizationToken,
  type SpeechGrammarList,
  type SpeechRecognitionAlternative,
  type SpeechRecognitionErrorEvent,
  type SpeechRecognitionEvent,
  type SpeechRecognitionEventListenerMap,
  type SpeechRecognitionResult,
  type SpeechRecognitionResultList
};

const meta = document.createElement('meta');

meta.setAttribute('name', 'web-speech-cognitive-services');
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
meta.setAttribute('content', `version=${process.env.npm_package_version}`);

document.head.appendChild(meta);
