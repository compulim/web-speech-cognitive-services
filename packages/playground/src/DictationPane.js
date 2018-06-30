import { css } from 'glamor';
import classNames from 'classnames';
import DictateButton from 'react-dictate-button';
import memoize from 'memoize-one';
import React from 'react';

function fontFamily(...fonts) {
  return fonts.map(font => `'${ font }'`).join(', ');
}

const ROOT_CSS = css({
  fontFamily: fontFamily('Calibri', 'Helvetica Neue', 'Arial', 'sans-serif'),

  '& h1, & h2': {
    fontFamily: fontFamily('Calibri Light', 'Helvetica Neue', 'Arial', 'sans-serif'),
    fontWeight: 200
  },

  '& h2': {
    fontSize: '125%'
  },

  '& ul': {
    listStyleType: 'none',
    margin: 0,
    padding: 0
  }
});

const ERROR_CSS = css({
  color: 'Red'
});

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.createExtra = memoize(subscriptionKey => ({ subscriptionKey }));

    this.handleDictate = this.handleDictate.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleProgress = this.handleProgress.bind(this);
    this.handleRawEvent = this.handleRawEvent.bind(this);

    this.state = {
      rawEvents: []
    };
  }

  handleDictate({ result }) {
    this.setState(() => ({
      error: null,
      final: result,
      interim: null
    }));
  }

  handleProgress({ results }) {
    this.setState(() => ({
      error: null,
      final: null,
      interim: results
    }));
  }

  handleError({ error }) {
    console.warn(error);

    this.setState(() => ({ error }));
  }

  handleRawEvent(event) {
    const { error, results, type } = event;

    this.setState(({ rawEvents }) => ({
      rawEvents: [
        ...(type === 'start' ? [] : rawEvents),
        type === 'error' ?
          `error "${ error }"`
        : type === 'result' ?
          (results[0].isFinal ? '(final) ' : '(interim) ') +
          `result "${ [].map.call(results[0], ({ transcript }) => transcript.trim()).join(' ') }"`
        : type
      ]
    }));
  }

  render() {
    const { props, state } = this;
    const keyFromSearch = typeof window.URLSearchParams !== 'undefined' && new URLSearchParams(window.location.search).get('s');
    const keyFromStorage = typeof window.localStorage !== 'undefined' && window.localStorage.getItem('SPEECH_KEY');
    const extra = this.createExtra(keyFromSearch || keyFromStorage);

    return (
      <article className={ classNames(ROOT_CSS + '', (props.className || '') + '') }>
        <header>
          <h1>{ props.name }</h1>
        </header>
        <section>
          <DictateButton
            extra={ extra }
            onDictate={ this.handleDictate }
            onError={ this.handleError }
            onProgress={ this.handleProgress }
            onRawEvent={ this.handleRawEvent }
            speechGrammarList={ props.speechGrammarList }
            speechRecognition={ props.speechRecognition }
          >
            { ({ readyState }) => readyState < 2 ? 'Start dictation' : 'Stop dictation' }
          </DictateButton>
          <header>
            <h2>Dictation result</h2>
          </header>
          {
            state.error ?
              <pre className={ ERROR_CSS + '' }>
                Error: { state.error }
              </pre>
            : state.final ?
              <p>
                { state.final.transcript }
              </p>
            : state.interim ?
              <p>
                {
                  state.interim.map((interim, index) =>
                    <span
                      key={ index }
                      style={{ opacity: Math.ceil(interim.confidence * 2) / 2 }}
                    >
                      { interim.transcript }
                    </span>
                  )
                }
              </p>
            : false
          }
          <header>
            <h2>Recent events</h2>
          </header>
          <ul>
            { state.rawEvents.map((event, index) => <li key={ index }><pre>{ event }</pre></li>) }
          </ul>
        </section>
      </article>
    );
  }
}
