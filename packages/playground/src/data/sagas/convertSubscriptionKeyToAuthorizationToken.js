import { call, put, select, takeLatest } from 'redux-saga/effects';

import { fetchAuthorizationToken as fetchSpeechServicesAuthorizationToken } from 'web-speech-cognitive-services/lib/SpeechServices';

import { CONVERT_SPEECH_SERVICES_SUBSCRIPTION_KEY_TO_AUTHORIZATION_TOKEN } from '../actions/convertSpeechServicesSubscriptionKeyToAuthorizationToken';
import setSpeechServicesAuthorizationToken from '../actions/setSpeechServicesAuthorizationToken';

export default function* convertSubscriptionKeyToAuthorizationTokenSaga() {
  yield takeLatest(CONVERT_SPEECH_SERVICES_SUBSCRIPTION_KEY_TO_AUTHORIZATION_TOKEN, function* () {
    try {
      const { region, speechServicesSubscriptionKey } = yield select();
      const authorizationToken = yield call(fetchSpeechServicesAuthorizationToken, {
        region,
        subscriptionKey: speechServicesSubscriptionKey
      });

      yield put(setSpeechServicesAuthorizationToken(authorizationToken));
    } catch (err) {
      console.error(err);
    }
  });
}
