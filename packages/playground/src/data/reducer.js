import { combineReducers } from 'redux';

import bingSpeechAuthorizationToken from './reducers/bingSpeechAuthorizationToken';
import bingSpeechSubscriptionKey from './reducers/bingSpeechSubscriptionKey';
import browserSupportedSpeechRecognition from './reducers/browserSupportedSpeechRecognition';
import navPane from './reducers/navPane';
import onDemandAuthorizationToken from './reducers/onDemandAuthorizationToken';
import ponyfill from './reducers/ponyfill';
import ponyfillType from './reducers/ponyfillType';
import region from './reducers/region';
import speechRecognitionContinuous from './reducers/speechRecognitionContinuous';
import speechRecognitionEvents from './reducers/speechRecognitionEvents';
import speechRecognitionInterimResults from './reducers/speechRecognitionInterimResults';
import speechRecognitionLanguage from './reducers/speechRecognitionLanguage';
import speechRecognitionMaxAlternatives from './reducers/speechRecognitionMaxAlternatives';
import speechRecognitionPhrases from './reducers/speechRecognitionPhrases';
import speechRecognitionReferenceGrammars from './reducers/speechRecognitionReferenceGrammars';
import speechRecognitionStarted from './reducers/speechRecognitionStarted';
import speechRecognitionTextNormalization from './reducers/speechRecognitionTextNormalization';
import speechServicesAuthorizationToken from './reducers/speechServicesAuthorizationToken';
import speechServicesSubscriptionKey from './reducers/speechServicesSubscriptionKey';
import speechSynthesisNativeVoices from './reducers/speechSynthesisNativeVoices';
import speechSynthesisText from './reducers/speechSynthesisText';
import speechSynthesisUtterances from './reducers/speechSynthesisUtterances';
import speechSynthesisVoiceURI from './reducers/speechSynthesisVoiceURI';

export default combineReducers({
  bingSpeechAuthorizationToken,
  bingSpeechSubscriptionKey,
  browserSupportedSpeechRecognition,
  navPane,
  onDemandAuthorizationToken,
  ponyfill,
  ponyfillType,
  region,
  speechRecognitionContinuous,
  speechRecognitionEvents,
  speechRecognitionInterimResults,
  speechRecognitionLanguage,
  speechRecognitionMaxAlternatives,
  speechRecognitionPhrases,
  speechRecognitionReferenceGrammars,
  speechRecognitionStarted,
  speechRecognitionTextNormalization,
  speechServicesAuthorizationToken,
  speechServicesSubscriptionKey,
  speechSynthesisNativeVoices,
  speechSynthesisText,
  speechSynthesisUtterances,
  speechSynthesisVoiceURI
})
