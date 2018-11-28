import {
  call,
  put,
  select,
  takeLatest
} from 'redux-saga/effects';

import { fetchAuthorizationToken } from 'web-speech-cognitive-services';

import { CONVERT_SUBSCRIPTION_KEY_TO_AUTHORIZATION_TOKEN } from '../actions/convertSubscriptionKeyToAuthorizationToken';
import setAuthorizationToken from '../actions/setAuthorizationToken';

export default function* () {
  yield takeLatest(CONVERT_SUBSCRIPTION_KEY_TO_AUTHORIZATION_TOKEN, function* () {
    try {
      const { region, subscriptionKey } = yield select();
      const authorizationToken = yield call(fetchAuthorizationToken, { region, subscriptionKey });

      yield put(setAuthorizationToken(authorizationToken));
    } catch (err) {}
  });
}
