import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import onErrorResumeNext from 'on-error-resume-next';

import reducer from './reducer';
import saga from './saga';

export default function () {
  const initialState = onErrorResumeNext(() => JSON.parse(window.sessionStorage.getItem('REDUX_STORE'))) || {};
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    reducer,
    initialState,
    applyMiddleware(
      sagaMiddleware,
      () => next => action => {
        console.log(action);

        return next(action);
      }
    )
  );

  sagaMiddleware.run(saga);

  store.subscribe(() => {
    const serializableStore = {
      ...store.getState(),
      speechRecognitionStarted: false
    };

    window.sessionStorage.setItem('REDUX_STORE', JSON.stringify(serializableStore));
  });

  return store;
}
