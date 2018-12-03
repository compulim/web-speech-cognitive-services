import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import onErrorResumeNext from 'on-error-resume-next';

import reducer from './reducer';
import saga from './saga';

function loadState() {
  const state = onErrorResumeNext(() => JSON.parse(window.sessionStorage.getItem('REDUX_STORE'))) || {};
  const urlSearchParams = new URLSearchParams(window.location.search);
  const bingSpeechSubscriptionKeyFromURL = urlSearchParams.get('bs');
  const speechServicesSubscriptionKeyFromURL = urlSearchParams.get('ss');

  if (bingSpeechSubscriptionKeyFromURL) {
    state.bingSpeechSubscriptionKey = bingSpeechSubscriptionKeyFromURL;
  }

  if (speechServicesSubscriptionKeyFromURL) {
    state.speechServicesSubscriptionKey = speechServicesSubscriptionKeyFromURL;
  }

  return state;
}

export default function () {
  const initialState = loadState();
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
    const state = store.getState();

    // Remove keys that should not be serialized
    const {
      authorizationToken,
      bingSpeechAuthorizationToken,
      ponyfill,
      speechRecognitionStarted,
      speechServicesAuthorizationToken,
      speechSynthesisNativeVoices,
      ...serializableState
    } = state;

    window.sessionStorage.setItem('REDUX_STORE', JSON.stringify(serializableState));
  });

  return store;
}
