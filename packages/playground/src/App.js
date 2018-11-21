import { css } from 'glamor';
import React from 'react';

import GitHubForkMe from './GitHubForkMe';
import SpeechRecognitionProvingGround from './SpeechRecognitionProvingGround';

const ROOT_CSS = css({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',

  '& > .speech-service-setup > label > input.speech-service-key': {
    width: '50%'
  },

  '& > .proving-grounds': {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',

    '& > *': {
      flex: 1
    }
  }
});

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.handleSubscriptionKeyChange = this.handleSubscriptionKeyChange.bind(this);

    const urlSearchParams = new URLSearchParams(window.location.search);

    this.state = {
      subscriptionKey: urlSearchParams.get('s') || localStorage.getItem('SPEECH_SERVICE_KEY')
    };
  }

  handleSubscriptionKeyChange({ target: { value } }) {
    this.setState(
      () => ({ subscriptionKey: value }),
      () => localStorage.setItem('SPEECH_SERVICE_KEY', value)
    );
  }

  render() {
    return (
      <div className={ ROOT_CSS }>
        <div className="speech-service-setup">
          <label>
            Subscription key&nbsp;
            <input
              className="speech-service-key"
              onChange={ this.handleSubscriptionKeyChange }
              type="text"
              value={ this.state.subscriptionKey }
            />
          </label>
        </div>
        <div className="proving-grounds">
          <SpeechRecognitionProvingGround
            subscriptionKey={ this.state.subscriptionKey }
          />
        </div>
        <GitHubForkMe owner="compulim" repo="web-speech-cognitive-services" />
      </div>
    );
  }
}
