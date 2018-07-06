import React from 'react';
import { Composer, Say } from 'react-say';
import { speechSynthesis, SpeechSynthesisUtterance } from 'component';

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
    speechSynthesis.cancel();
    this.setState(() => ({ started: false }));
  }

  render() {
    const { state } = this;

    return (
      <div>
        <button onClick={ this.handleStartClick }>Start</button>
        <button onClick={ this.handleStopClick }>Stop</button>
        {
          state.started &&
            <Composer
              speechSynthesis={ speechSynthesis }
              speechSynthesisUtterance={ SpeechSynthesisUtterance }
            >
              <Say text="Pooh is very social." />
              <Say text="After Christopher Robin, his closest friend is Piglet." />
              <Say text="And he must often chooses to spend his time with one or both of them." />
            </Composer>
        }
      </div>
    );
  }
}
