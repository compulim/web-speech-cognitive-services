import {
  call,
  put,
  select,
  takeLatest
} from 'redux-saga/effects';

import { SET_BING_SPEECH_AUTHORIZATION_TOKEN } from '../actions/setBingSpeechAuthorizationToken';
import { SET_BING_SPEECH_SUBSCRIPTION_KEY } from '../actions/setBingSpeechSubscriptionKey';
import { SET_ON_DEMAND_AUTHORIZATION_TOKEN } from '../actions/setOnDemandAuthorizationToken';
import { SET_PONYFILL_TYPE } from '../actions/setPonyfillType';
import { SET_REGION } from '../actions/setRegion';
import { SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION } from '../actions/setSpeechRecognitionTextNormalization';
import { SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN } from '../actions/setSpeechServicesAuthorizationToken';
import { SET_SPEECH_SERVICES_SUBSCRIPTION_KEY } from '../actions/setSpeechServicesSubscriptionKey';
import setPonyfill from '../actions/setPonyfill';

import createBingSpeechPonyfill, { fetchAuthorizationToken as fetchBingSpeechAuthorizationToken } from 'web-speech-cognitive-services/lib/BingSpeech';
import createSpeechServicesPonyfill, { fetchAuthorizationToken as fetchSpeechServicesAuthorizationToken } from 'web-speech-cognitive-services/lib/SpeechServices';

export default function* () {
  yield* setPonyfillSaga();

  yield takeLatest(
    ({ type }) =>
      type === SET_BING_SPEECH_AUTHORIZATION_TOKEN
      || type === SET_BING_SPEECH_SUBSCRIPTION_KEY
      || type === SET_PONYFILL_TYPE
      || type === SET_REGION
      || type === SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION
      || type === SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN
      || type === SET_SPEECH_SERVICES_SUBSCRIPTION_KEY
      || type === SET_ON_DEMAND_AUTHORIZATION_TOKEN,
    setPonyfillSaga
  );
}

function* setPonyfillSaga() {
  const {
    bingSpeechAuthorizationToken,
    bingSpeechSubscriptionKey,
    onDemandAuthorizationToken,
    ponyfillType,
    region,
    speechRecognitionTextNormalization: textNormalization,
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
        {
          authorizationToken: onDemandAuthorizationToken ? () => {
            console.log('On-demand fetching Bing Speech authorization token');

            return fetchBingSpeechAuthorizationToken(bingSpeechSubscriptionKey);
          } : null,
          subscriptionKey: onDemandAuthorizationToken ? null : bingSpeechSubscriptionKey
        }
    );

    yield put(setPonyfill(ponyfill));
  } else {
    const options = {
      region,
      textNormalization,
    };

    const ponyfill = yield call(
      createSpeechServicesPonyfill,
      speechServicesAuthorizationToken ?
        { ...options, authorizationToken: speechServicesAuthorizationToken }
      :
        {
          ...options,
          authorizationToken: onDemandAuthorizationToken ? () => {
            console.log('On-demand fetching Speech Services authorization token');

            return fetchSpeechServicesAuthorizationToken({
              region,
              subscriptionKey: speechServicesSubscriptionKey
            });
          } : null,
          subscriptionKey: onDemandAuthorizationToken ? null : speechServicesSubscriptionKey
        }
    );

    yield put(setPonyfill(ponyfill));
  }
}
