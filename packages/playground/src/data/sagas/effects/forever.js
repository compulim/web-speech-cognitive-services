import { call } from 'redux-saga/effects';

export default function* () {
  yield call(new Promise(() => {}));
}
