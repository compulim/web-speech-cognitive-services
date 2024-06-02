import onErrorResumeNext from 'on-error-resume-next';
import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';

import reducer from './reducer';
import saga from './saga';

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
      authorizationToken: _authorizationToken,
      ponyfill: _ponyfill,
      speechRecognitionStarted: _speechRecognitionStarted,
      speechServicesAuthorizationToken: _speechServicesAuthorizationToken,
      speechSynthesisNativeVoices: _speechSynthesisNativeVoices,
      ...serializableState
    } = state;

    window.sessionStorage.setItem('REDUX_STORE', JSON.stringify(serializableState));
  });

  return store;
}
