import createSpeechRecognitionPonyfill from './SpeechServices/SpeechToText';
import createSpeechSynthesisPonyfill from './SpeechServices/TextToSpeech';
import fetchAuthorizationToken from './SpeechServices/fetchAuthorizationToken';

export default async function (...args) {
  return {
    ...(await createSpeechRecognitionPonyfill(...args)),
    ...(await createSpeechSynthesisPonyfill(...args))
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
