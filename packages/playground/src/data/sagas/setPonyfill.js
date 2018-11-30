import {
  call,
  put,
  select,
  takeLatest
} from 'redux-saga/effects';

import { SET_BING_SPEECH_AUTHORIZATION_TOKEN } from '../actions/setBingSpeechAuthorizationToken';
import { SET_BING_SPEECH_SUBSCRIPTION_KEY } from '../actions/setBingSpeechSubscriptionKey';
import { SET_PONYFILL_TYPE } from '../actions/setPonyfillType';
import { SET_REGION } from '../actions/setRegion';
import { SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN } from '../actions/setSpeechServicesAuthorizationToken';
import { SET_SPEECH_SERVICES_SUBSCRIPTION_KEY } from '../actions/setSpeechServicesSubscriptionKey';
import setPonyfill from '../actions/setPonyfill';

import createBingSpeechPonyfill from 'web-speech-cognitive-services/lib/BingSpeech';
import createSpeechServicesPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

export default function* () {
  yield* setPonyfillSaga();

  yield takeLatest(
    ({ type }) =>
      type === SET_BING_SPEECH_AUTHORIZATION_TOKEN
      || type === SET_BING_SPEECH_SUBSCRIPTION_KEY
      || type === SET_PONYFILL_TYPE
      || type === SET_REGION
      || type === SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN
      || type === SET_SPEECH_SERVICES_SUBSCRIPTION_KEY,
    setPonyfillSaga
  );
}

function* setPonyfillSaga() {
  const {
    bingSpeechAuthorizationToken,
    bingSpeechSubscriptionKey,
    ponyfillType,
    region,
    speechServicesAuthorizationToken,
    speechServicesSubscriptionKey
  } = yield select();

  if (ponyfillType === 'browser') {
    yield put(setPonyfill({
      SpeechGrammarList: window.SpeechGrammarList || window.webkitSpeechGrammarList,
      SpeechRecognition: window.SpeechRecognition || window.webkitSpeechRecognition,
      speechSynthesis: window.speechSynthesis,
      SpeechSynthesisUtterance: window.SpeechSynthesisUtterance
    }));
  } else if (ponyfillType === 'bingspeech') {
    const ponyfill = yield call(
      createBingSpeechPonyfill,
      bingSpeechAuthorizationToken ?
        { authorizationToken: bingSpeechAuthorizationToken }
      :
        { bingSpeechSubscriptionKey }
    );

    yield put(setPonyfill(ponyfill));
  } else {
    const ponyfill = yield call(
      createSpeechServicesPonyfill,
      speechServicesAuthorizationToken ?
        { authorizationToken: speechServicesAuthorizationToken, region }
      :
        { region, speechServicesSubscriptionKey }
    );

    yield put(setPonyfill(ponyfill));
  }
}
