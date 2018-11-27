import {
  call,
  put,
  select,
  takeLatest
} from 'redux-saga/effects';

import { SET_PONYFILL_TYPE } from '../actions/setPonyfillType';
import { SET_REGION } from '../actions/setRegion';
import { SET_SUBSCRIPTION_KEY } from '../actions/setSubscriptionKey';
import setPonyfill from '../actions/setPonyfill';

import createPonyfill from 'web-speech-cognitive-services';

export default function* () {
  yield* setPonyfillSaga();

  yield takeLatest(
    ({ type }) => type === SET_PONYFILL_TYPE || type === SET_REGION || type === SET_SUBSCRIPTION_KEY,
    setPonyfillSaga
  );
}

function* setPonyfillSaga() {
  const { ponyfillType, region, subscriptionKey } = yield select();

  if (ponyfillType === 'cognitiveservices') {
    const ponyfill = yield call(createPonyfill, { region, subscriptionKey });

    yield put(setPonyfill(ponyfill));
  } else {
    yield put(setPonyfill({
      SpeechGrammarList: window.SpeechGrammarList || window.webkitSpeechGrammarList,
      SpeechRecognition: window.SpeechRecognition || window.webkitSpeechRecognition,
      speechSynthesis: window.speechSynthesis,
      SpeechSynthesisUtterance: window.SpeechSynthesisUtterance
    }));
  }
}
