import createSpeechRecognitionPonyfill from './SpeechServices/SpeechToText';
import createSpeechSynthesisPonyfill from './SpeechServices/TextToSpeech';
import fetchAuthorizationToken from './SpeechServices/fetchAuthorizationToken';

export default function createSpeechServicesPonyfill(...args) {
  return {
    ...createSpeechRecognitionPonyfill(...args),
    ...createSpeechSynthesisPonyfill(...args)
  };
};

export {
  createSpeechRecognitionPonyfill,
  createSpeechSynthesisPonyfill,
  fetchAuthorizationToken
}

const meta = document.createElement('meta');

meta.setAttribute('name', 'web-speech-cognitive-services');
meta.setAttribute('content', `version=${ process.env.NPM_PACKAGE_VERSION }`);

document.head.appendChild(meta);
