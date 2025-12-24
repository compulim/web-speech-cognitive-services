import { combineReducers } from 'redux';

import browserSupportedSpeechRecognition from './reducers/browserSupportedSpeechRecognition.ts';
import enableTelemetry from './reducers/enableTelemetry.ts';
import navPane from './reducers/navPane.ts';
import onDemandAuthorizationToken from './reducers/onDemandAuthorizationToken.js';
import ponyfill from './reducers/ponyfill.js';
import ponyfillType from './reducers/ponyfillType.js';
import region from './reducers/region.js';
import speechRecognitionContinuous from './reducers/speechRecognitionContinuous.js';
import speechRecognitionDelayedStart from './reducers/speechRecognitionDelayedStart.js';
import speechRecognitionEndpointId from './reducers/speechRecognitionEndpointId.js';
import speechRecognitionEvents from './reducers/speechRecognitionEvents.js';
import speechRecognitionInitialSilenceTimeout from './reducers/speechRecognitionInitialSilenceTimeout.ts';
import speechRecognitionInterimResults from './reducers/speechRecognitionInterimResults.js';
import speechRecognitionLanguage from './reducers/speechRecognitionLanguage.js';
import speechRecognitionMaxAlternatives from './reducers/speechRecognitionMaxAlternatives.js';
import speechRecognitionPhrases from './reducers/speechRecognitionPhrases.js';
import speechRecognitionReferenceGrammars from './reducers/speechRecognitionReferenceGrammars.js';
import speechRecognitionStarted from './reducers/speechRecognitionStarted.js';
import speechRecognitionTextNormalization from './reducers/speechRecognitionTextNormalization.js';
import speechServicesAuthorizationToken from './reducers/speechServicesAuthorizationToken.js';
import speechServicesSubscriptionKey from './reducers/speechServicesSubscriptionKey.js';
import speechSynthesisDeploymentId from './reducers/speechSynthesisDeploymentId.js';
import speechSynthesisNativeVoices from './reducers/speechSynthesisNativeVoices.js';
import speechSynthesisOutputFormat from './reducers/speechSynthesisOutputFormat.js';
import speechSynthesisText from './reducers/speechSynthesisText.js';
import speechSynthesisUtterances from './reducers/speechSynthesisUtterances.js';
import speechSynthesisVoiceURI from './reducers/speechSynthesisVoiceURI.js';

export default combineReducers({
  browserSupportedSpeechRecognition,
  enableTelemetry,
  navPane,
  onDemandAuthorizationToken,
  ponyfill,
  ponyfillType,
  region,
  speechRecognitionContinuous,
  speechRecognitionDelayedStart,
  speechRecognitionEndpointId,
  speechRecognitionEvents,
  speechRecognitionInitialSilenceTimeout,
  speechRecognitionInterimResults,
  speechRecognitionLanguage,
  speechRecognitionMaxAlternatives,
  speechRecognitionPhrases,
  speechRecognitionReferenceGrammars,
  speechRecognitionStarted,
  speechRecognitionTextNormalization,
  speechServicesAuthorizationToken,
  speechServicesSubscriptionKey,
  speechSynthesisDeploymentId,
  speechSynthesisNativeVoices,
  speechSynthesisOutputFormat,
  speechSynthesisText,
  speechSynthesisUtterances,
  speechSynthesisVoiceURI
});
