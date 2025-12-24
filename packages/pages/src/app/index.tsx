import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.jsx';
import createStore from './data/createStore.js';

const store = createStore();

const mainElement = document.getElementsByTagName('main')[0];

mainElement &&
  createRoot(mainElement)?.render(
    <Provider store={store}>
      <App />
    </Provider>
  );

declare global {
  const IS_DEVELOPMENT: boolean | undefined;
}

typeof IS_DEVELOPMENT !== 'undefined' &&
  IS_DEVELOPMENT &&
  new EventSource('/esbuild').addEventListener('change', () => location.reload());
