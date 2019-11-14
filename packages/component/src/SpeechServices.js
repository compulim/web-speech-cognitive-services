/* global process */

import createSpeechRecognitionPonyfill, { createSpeechRecognitionPonyfillFromRecognizer } from './SpeechServices/SpeechToText';
import createSpeechSynthesisPonyfill from './SpeechServices/TextToSpeech';
import fetchAuthorizationToken from './SpeechServices/fetchAuthorizationToken';

let shouldWarnOnSubscriptionKey = true;

export default function createSpeechServicesPonyfill(options = {}, ...args) {
  if (shouldWarnOnSubscriptionKey && options.subscriptionKey) {
    console.warn('web-speech-cognitive-services: In production environment, subscription key should not be used, authorization token should be used instead.');

    shouldWarnOnSubscriptionKey = false;
  }

  const ponyfill = {
    ...createSpeechRecognitionPonyfill(options, ...args),
    ...createSpeechSynthesisPonyfill(options, ...args),
  };

  return {
    ...ponyfill,
    then: resolve => {
      console.warn('web-speech-cognitive-services: This function no longer need to be called in an asynchronous fashion. Please update your code. We will remove this Promise.then function on or after 2020-08-10.');

      resolve(ponyfill);
    }
  };
}

export {
  createSpeechRecognitionPonyfill,
  createSpeechRecognitionPonyfillFromRecognizer,
  createSpeechSynthesisPonyfill,
  fetchAuthorizationToken
}

const meta = document.createElement('meta');

meta.setAttribute('name', 'web-speech-cognitive-services');
meta.setAttribute('content', `version=${ process.env.NPM_PACKAGE_VERSION }`);

document.head.appendChild(meta);
