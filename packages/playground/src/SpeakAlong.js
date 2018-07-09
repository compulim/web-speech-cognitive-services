import { css } from 'glamor';
import { Say } from 'react-say';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const ROOT_CSS = css({
  '&.error': {
    color: 'Red'
  },

  '&:not(.error) > .unspoken': {
    opacity: .5
  }
});

export default class SpeakAlong extends React.Component {
  constructor(props) {
    super(props);

    this.handleBoundary = this.handleBoundary.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleError = this.handleError.bind(this);

    this.state = {
      error: false,
      spoken: 0
    };
  }

  handleBoundary({ charIndex }) {
    this.setState(() => ({
      spoken: charIndex
    }));
  }

  handleEnd() {
    this.setState(() => ({
      spoken: Infinity
    }));
  }

  handleError() {
    this.setState(() => ({
      error: true
    }));
  }

  render() {
    const { props, state: { error, spoken } } = this;

    return (
      <p className={ classNames(ROOT_CSS + '', { error }) }>
        <span className="spoken">{ props.text.slice(0, spoken) }</span>
        <span className="unspoken">{ props.text.slice(spoken) }</span>
        <Say
          lang={ this.lang || '' }
          onBoundary={ this.handleBoundary }
          onEnd={ this.handleEnd }
          onError={ this.handleError }
          pitch={ props.pitch || 1 }
          rate={ props.rate || 1 }
          text={ props.text }
          voice={ props.voice || null }
          volume={ props.volume || 1 }
        />
      </p>
    );
  }
}

SpeakAlong.propTypes = {
  lang: PropTypes.string,
  pitch: PropTypes.number,
  rate: PropTypes.number,
  text: PropTypes.string,
  voice: PropTypes.any,
  volume: PropTypes.number
};
