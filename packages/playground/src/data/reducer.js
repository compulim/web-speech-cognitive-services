import { combineReducers } from 'redux';

import browserSupportedSpeechRecognition from './reducers/browserSupportedSpeechRecognition';
import navPane from './reducers/navPane';
import ponyfillType from './reducers/ponyfillType';
import region from './reducers/region';
import speechRecognitionContinuous from './reducers/speechRecognitionContinuous';
import speechRecognitionEvents from './reducers/speechRecognitionEvents';
import speechRecognitionInterimResults from './reducers/speechRecognitionInterimResults';
import speechRecognitionMaxAlternatives from './reducers/speechRecognitionMaxAlternatives';
import speechRecognitionStarted from './reducers/speechRecognitionStarted';
import speechSynthesisText from './reducers/speechSynthesisText';
import speechSynthesisVoiceURI from './reducers/speechSynthesisVoiceURI';
import subscriptionKey from './reducers/subscriptionKey';

export default combineReducers({
  browserSupportedSpeechRecognition,
  navPane,
  ponyfillType,
  region,
  speechRecognitionContinuous,
  speechRecognitionEvents,
  speechRecognitionInterimResults,
  speechRecognitionMaxAlternatives,
  speechRecognitionStarted,
  speechSynthesisText,
  speechSynthesisVoiceURI,
  subscriptionKey
})
