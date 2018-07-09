import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Say from 'react-say';

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

  handleError({ error }) {
    alert(error);

    this.setState(() => ({
      error: true
    }));
  }

  render() {
    const { props, state: { error, spoken } } = this;

    return (
      <p className={ classNames(ROOT_CSS + '', { error }) }>
        <span className="spoken">{ props.speak.slice(0, spoken) }</span>
        <span className="unspoken">{ props.speak.slice(spoken) }</span>
        <Say
          lang={ props.lang || '' }
          onBoundary={ this.handleBoundary }
          onEnd={ this.handleEnd }
          onError={ this.handleError }
          pitch={ props.pitch || 1 }
          rate={ props.rate || 1 }
          speak={ props.speak }
          speechSynthesis={ props.speechSynthesis }
          speechSynthesisUtterance={ props.speechSynthesisUtterance }
          voice={ props.voice }
          volume={ props.volume || 1 }
        />
      </p>
    );
  }
}

SpeakAlong.defaultProps = {
  speak: ''
};

SpeakAlong.propTypes = {
  lang: PropTypes.string,
  pitch: PropTypes.number,
  rate: PropTypes.number,
  speak: PropTypes.string,
  speechSynthesis: PropTypes.any,
  speechSynthesisUtterance: PropTypes.any,
  voice: PropTypes.any,
  volume: PropTypes.number
};
