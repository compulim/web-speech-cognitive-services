import { call } from 'redux-saga/effects';

export default function* forever() {
  yield call(() => new Promise(() => {}));
}
