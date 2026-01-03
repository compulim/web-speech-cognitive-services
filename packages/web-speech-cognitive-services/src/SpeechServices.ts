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
} from './SpeechServices/SpeechToText.ts';
// @ts-expect-error Not typed.
import createSpeechSynthesisPonyfill from './SpeechServices/TextToSpeech.js';
import fetchAuthorizationToken from './SpeechServices/fetchAuthorizationToken.ts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createSpeechServicesPonyfill(options: any = {}): any {
  return {
    ...createSpeechRecognitionPonyfill(options),
    ...createSpeechSynthesisPonyfill(options)
  };
}

const meta = document.createElement('meta');

meta.setAttribute('name', 'web-speech-cognitive-services');
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
meta.setAttribute('content', `version=${process.env.npm_package_version}`);

document.head.appendChild(meta);

export default createSpeechServicesPonyfill;
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
