import React from 'react';
import logo from './logo.svg';
import './App.css';
import DictateButton from 'react-dictate-button';

import CognitiveServicesSpeechRecognition from 'component';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  handleProgressAndDictate = (type, event) => {
    console.warn(type);

    this.setState(() => ({
      dictated: (event.results || (event.result ? [event.result] : [])).map(({ transcript }) => transcript.trim()).join(' ')
    }));
  }

  handleError = event => {
    console.warn(event.error);
  }

  handleRawEvent = event => {
    if (event.type === 'error') {
      console.log(`Got "${ event.type }" of "${ event.error }"`);
    } else {
      console.log(`Got "${ event.type }"`);

      if (event.type === 'onresult') {
        console.log(event.results);
      }
    }
  }

  render() {
    const { state } = this;

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <DictateButton
          onDictate={ this.handleProgressAndDictate.bind(null, 'dictate') }
          onError={ this.handleError }
          onProgress={ this.handleProgressAndDictate.bind(null, 'progress') }
          onRawEvent={ this.handleRawEvent }
          speechRecognition={ CognitiveServicesSpeechRecognition }
        >
          { ({ readyState }) => readyState < 2 ? 'Dictate' : 'Stop' }
        </DictateButton>
        <p>
          { state.dictated }
        </p>
      </div>
    );
  }
}
