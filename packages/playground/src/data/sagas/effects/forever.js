import { call } from 'redux-saga/effects';

export default function* forever() {
  /* eslint-disable-next-line no-empty-function */
  yield call(() => new Promise(() => {}));
}
