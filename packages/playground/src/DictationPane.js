import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';
import DictateButton from 'react-dictate-button';
import memoize from 'memoize-one';

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

    this.state = {};
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
    const { props, state } = this;
    const keyFromSearch = typeof window.URLSearchParams !== 'undefined' && new URLSearchParams(window.location.search).get('s');
    const keyFromStorage = window.localStorage.getItem('SPEECH_KEY');
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
        </section>
      </article>
    );
  }
}
