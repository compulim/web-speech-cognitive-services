import { onErrorResumeNext } from 'on-error-resume-next';
import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';

import reducer from './reducer.js';
import saga from './saga.js';

function loadState() {
  const state = onErrorResumeNext(() => JSON.parse(window.sessionStorage.getItem('REDUX_STORE'))) || {};
  const urlSearchParams = new URLSearchParams(window.location.search);
  const speechServicesSubscriptionKeyFromURL = urlSearchParams.get('ss');
  const regionFromURL = urlSearchParams.get('r');

  if (speechServicesSubscriptionKeyFromURL) {
    state.speechServicesSubscriptionKey = speechServicesSubscriptionKeyFromURL;
  }

  if (regionFromURL) {
    state.region = regionFromURL;
  }

  return state;
}

export default function createPlaygroundStore() {
  const initialState = loadState();
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    reducer,
    initialState,
    applyMiddleware(
      sagaMiddleware
      // () => next => action => {
      //   console.log(action);

      //   return next(action);
      // }
    )
  );

  sagaMiddleware.run(saga);

  store.subscribe(() => {
    const state = store.getState();

    // Remove keys that should not be serialized
    const {
      // eslint-disable-next-line no-unused-vars
      authorizationToken: _authorizationToken,
      // eslint-disable-next-line no-unused-vars
      ponyfill: _ponyfill,
      // eslint-disable-next-line no-unused-vars
      speechRecognitionStarted: _speechRecognitionStarted,
      // eslint-disable-next-line no-unused-vars
      speechServicesAuthorizationToken: _speechServicesAuthorizationToken,
      // eslint-disable-next-line no-unused-vars
      speechSynthesisNativeVoices: _speechSynthesisNativeVoices,
      ...serializableState
    } = state;

    window.sessionStorage.setItem('REDUX_STORE', JSON.stringify(serializableState));
  });

  return store;
}
