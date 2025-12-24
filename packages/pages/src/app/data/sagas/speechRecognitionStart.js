/* eslint no-magic-numbers: ["error", { "ignore": [2000] }] */

import { call, cancel, fork, join, put, race, select, take } from 'redux-saga/effects';

import addSpeechRecognitionEvent from '../actions/addSpeechRecognitionEvent.ts';
import clearSpeechRecognitionEvent from '../actions/clearSpeechRecognitionEvent.ts';
import getPonyfillCapabilities from '../../getPonyfillCapabilities.js';

import { ABORT_SPEECH_RECOGNITION } from '../actions/abortSpeechRecognition.ts';
import { START_SPEECH_RECOGNITION } from '../actions/startSpeechRecognition.ts';
import setSpeechRecognitionInstance from '../actions/setSpeechRecognitionInstance.ts';
import stopSpeechRecognition, { STOP_SPEECH_RECOGNITION } from '../actions/stopSpeechRecognition.ts';

function sleep(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

function* startSpeechRecognition({ getCancelReason }) {
  let speechRecognition;

  yield put(clearSpeechRecognitionEvent());
  yield put(addSpeechRecognitionEvent({ type: 'ui:start' }));

  try {
    const {
      ponyfill: { SpeechRecognition },
      ponyfillType,
      speechRecognitionContinuous: continuous,
      speechRecognitionInterimResults: interimResults,
      speechRecognitionLanguage: language,
      speechRecognitionMaxAlternatives: maxAlternatives,
      speechRecognitionPhrases: phrases
    } = yield select();

    speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = continuous;
    speechRecognition.grammars.phrases = phrases;
    speechRecognition.interimResults = interimResults;
    speechRecognition.lang = language;

    const ponyfillCapabilities = getPonyfillCapabilities(ponyfillType);

    // TODO: Cognitive Services currently does not return multiple alternatives
    if (ponyfillCapabilities.maxAlternatives) {
      speechRecognition.maxAlternatives = maxAlternatives;
    }

    yield put(setSpeechRecognitionInstance(speechRecognition));

    yield call(
      () =>
        new Promise(resolve => {
          speechRecognition.addEventListener('error', resolve);
          speechRecognition.addEventListener('end', resolve);
          speechRecognition.start();
        })
    );
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

export default function* speechRecognitionStartSaga() {
  for (;;) {
    let cancelReason;

    yield take(START_SPEECH_RECOGNITION);

    const { speechRecognitionDelayedStart: delayedStart } = yield select();

    if (delayedStart) {
      yield call(sleep, 2000);
    }

    const task = yield fork(startSpeechRecognition, {
      getCancelReason: () => cancelReason
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
