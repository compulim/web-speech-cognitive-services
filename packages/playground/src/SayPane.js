import React from 'react';
import { Composer } from 'react-say';
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
            <Composer
              speechSynthesis={ props.speechSynthesis }
              speechSynthesisUtterance={ props.speechSynthesisUtterance }
            >
              <SpeakAlong text="Pooh is very social." voice={ props.voice } volume={ 0.1 } />
              <SpeakAlong pitch={ 1.5 } text="After Christopher Robin, his closest friend is Piglet." voice={ props.voice } />
              <SpeakAlong rate={ 1.5 } text="And he must often chooses to spend his time with one or both of them." voice={ props.voice } />
            </Composer>
        }
      </div>
    );
  }
}

SayPane.defaultProps = {
  speechSynthesis: window.speechSynthesis,
  SpeechSynthesisUtterance: window.SpeechSynthesisUtterance
};
