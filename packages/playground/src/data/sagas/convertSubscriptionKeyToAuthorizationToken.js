import {
  call,
  put,
  select,
  takeLatest
} from 'redux-saga/effects';

import { fetchAuthorizationToken as fetchSpeechServicesAuthorizationToken } from 'web-speech-cognitive-services/lib/SpeechServices';
import { fetchAuthorizationToken as fetchBingSpeechAuthorizationToken } from 'web-speech-cognitive-services/lib/BingSpeech';

import { CONVERT_BING_SPEECH_SUBSCRIPTION_KEY_TO_AUTHORIZATION_TOKEN } from '../actions/convertBingSpeechSubscriptionKeyToAuthorizationToken';
import { CONVERT_SPEECH_SERVICES_SUBSCRIPTION_KEY_TO_AUTHORIZATION_TOKEN } from '../actions/convertSpeechServicesSubscriptionKeyToAuthorizationToken';
import setBingSpeechAuthorizationToken from '../actions/setBingSpeechAuthorizationToken';
import setSpeechServicesAuthorizationToken from '../actions/setSpeechServicesAuthorizationToken';

export default function* () {
  yield takeLatest(CONVERT_BING_SPEECH_SUBSCRIPTION_KEY_TO_AUTHORIZATION_TOKEN, function* () {
    try {
      const { bingSpeechSubscriptionKey } = yield select();
      const authorizationToken = yield call(fetchBingSpeechAuthorizationToken, bingSpeechSubscriptionKey);

      yield put(setBingSpeechAuthorizationToken(authorizationToken));
    } catch (err) {}
  });

  yield takeLatest(CONVERT_SPEECH_SERVICES_SUBSCRIPTION_KEY_TO_AUTHORIZATION_TOKEN, function* () {
    try {
      const { region, speechServicesSubscriptionKey } = yield select();
      const authorizationToken = yield call(fetchSpeechServicesAuthorizationToken, { region, subscriptionKey: speechServicesSubscriptionKey });

      yield put(setSpeechServicesAuthorizationToken(authorizationToken));
    } catch (err) {}
  });
}
