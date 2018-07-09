import React from 'react';
import SpeakAlong from './SpeakAlong';

export default class SayPane extends React.Component {
  constructor(props) {
    super(props);

    this.handleStartClick = this.handleStartClick.bind(this);
    this.handleStopClick = this.handleStopClick.bind(this);

    this.state = {
      started: false
    };
  }

  handleStartClick() {
    this.setState(() => ({ started: true }));
  }

  handleStopClick() {
    this.props.speechSynthesis.cancel();
    this.setState(() => ({ started: false }));
  }

  render() {
    const { props, state } = this;

    return (
      <div>
        <button
          disabled={ !props.speechSynthesis }
          onClick={ this.handleStartClick }
        >
          Start
        </button>
        <button
          disabled={ !state.started }
          onClick={ this.handleStopClick }
        >
          Stop
        </button>
        {
          state.started &&
            <React.Fragment>
              <SpeakAlong
                speak="Pooh is very social."
                speechSynthesis={ props.speechSynthesis }
                speechSynthesisUtterance={ props.speechSynthesisUtterance }
                voice={ props.voice }
                volume={ 0.1 }
              />
              <SpeakAlong
                pitch={ 1.5 }
                speak="After Christopher Robin, his closest friend is Piglet."
                speechSynthesis={ props.speechSynthesis }
                speechSynthesisUtterance={ props.speechSynthesisUtterance }
                voice={ props.voice }
              />
              <SpeakAlong
                rate={ 1.5 }
                speak="And he must often chooses to spend his time with one or both of them."
                speechSynthesis={ props.speechSynthesis }
                speechSynthesisUtterance={ props.speechSynthesisUtterance }
                voice={ props.voice }
              />
            </React.Fragment>
        }
      </div>
    );
  }
}

SayPane.defaultProps = {
  speechSynthesis: window.speechSynthesis,
  SpeechSynthesisUtterance: window.SpeechSynthesisUtterance
};
