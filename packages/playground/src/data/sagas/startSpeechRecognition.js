import { call, cancel, fork, join, put, race, select, take } from 'redux-saga/effects';
import createCognitiveServicesPonyfill from 'web-speech-cognitive-services';

import addSpeechRecognitionEvent from '../actions/addSpeechRecognitionEvent';
import clearSpeechRecognitionEvent from '../actions/clearSpeechRecognitionEvent';

import { ABORT_SPEECH_RECOGNITION } from '../actions/abortSpeechRecognition';
import { START_SPEECH_RECOGNITION } from '../actions/startSpeechRecognition';
import setSpeechRecognitionInstance from '../actions/setSpeechRecognitionInstance';
import stopSpeechRecognition, { STOP_SPEECH_RECOGNITION } from '../actions/stopSpeechRecognition';

export default function* () {
  for (;;) {
    let cancelReason;

    const start = yield take(START_SPEECH_RECOGNITION);
    const task = yield fork(startSpeechRecognition, {
      continuous: start.continuous,
      getCancelReason: () => cancelReason,
      interimResults: start.interimResults
    });

    const { abort, stop } = yield race({
      abort: take(ABORT_SPEECH_RECOGNITION),
      stop: take(STOP_SPEECH_RECOGNITION),
      taskCompleted: join(task)
    });

    if (abort || stop) {
      if (abort) {
        yield put(addSpeechRecognitionEvent({ type: 'ui:abort' }));
        cancelReason = 'abort';
      } else if (stop) {
        yield put(addSpeechRecognitionEvent({ type: 'ui:stop' }));
        cancelReason = 'stop';
      }

      yield cancel(task);
    } else {
      yield put(stopSpeechRecognition());
    }
  }
}

function* startSpeechRecognition({ getCancelReason }) {
  let speechRecognition;

  yield put(clearSpeechRecognitionEvent());
  yield put(addSpeechRecognitionEvent({ type: 'ui:start' }));

  try {
    const {
      ponyfillType,
      region,
      speechRecognitionContinuous: continuous,
      speechRecognitionInterimResults: interimResults,
      subscriptionKey
    } = yield select();

    const { SpeechRecognition } = yield call(createPonyfill, ponyfillType, region, subscriptionKey);

    speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = continuous;
    speechRecognition.interimResults = interimResults;

    yield put(setSpeechRecognitionInstance(speechRecognition));

    yield call(() => new Promise(resolve => {
      speechRecognition.addEventListener('error', resolve);
      speechRecognition.addEventListener('end', resolve);
      speechRecognition.start();
    }));
  } finally {
    if (speechRecognition) {
      if (getCancelReason() === 'abort') {
        speechRecognition.abort();
      } else {
        speechRecognition.stop();
      }
    }
  }
}

async function createPonyfill(ponyfillType, region, subscriptionKey) {
  switch (ponyfillType) {
    case 'cognitiveservices':
      return await createCognitiveServicesPonyfill({ region, subscriptionKey });

    default:
      return {
        SpeechGrammarList: window.SpeechGrammarList || window.webkitSpeechGrammarList,
        SpeechRecognition: window.SpeechRecognition || window.webkitSpeechRecognition
      };
  }
}
