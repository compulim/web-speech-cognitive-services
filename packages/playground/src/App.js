import { connect } from 'react-redux';
import React from 'react';
import memoize from 'memoize-one';

import GitHubForkMe from './GitHubForkMe';
// import SpeechRecognitionProvingGround from './SpeechRecognitionProvingGround';

import createPonyfill from 'web-speech-cognitive-services';

import PonyfillSelector from './UI/PonyfillSelector';
import RegionSelector from './UI/RegionSelector';
import SubscriptionKeyInput from './UI/SubscriptionKeyInput';
import SpeechRecognitionProvingGround from './SpeechRecognitionProvingGround2';

class App extends React.Component {
  constructor() {
    super();

    this.createPonyfill = memoize(async (ponyfillType, region, subscriptionKey) => {
      let ponyfill;

      switch (ponyfillType) {
        case 'cognitiveservices':
          ponyfill = await createPonyfill({ region, subscriptionKey });

          break;

        default:
          ponyfill = {
            SpeechGrammarList: window.SpeechGrammarList || window.webkitSpeechGrammarList,
            SpeechRecognition: window.SpeechRecognition || window.webkitSpeechRecognition
          };

          break;
      }

      this.setState(() => ({ ponyfill }));
    });

    this.state = { ponyfill: null };
  }

  componentDidMount() {
    this.createPonyfillIfNeeded(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.createPonyfillIfNeeded(nextProps);
  }

  createPonyfillIfNeeded({ ponyfillType, region, subscriptionKey }) {
    this.createPonyfill(ponyfillType, region, subscriptionKey);
  }

  render() {
    const { ponyfill } = this.state;

    return (
      <div>
        <div className="jumbotron">
          <h1 className="display-4">web-speech-cognitive-services</h1>
          <p className="lead">Ponyfills for Web Speech API using Cognitive Services Speech Services</p>
        </div>
        <div className="container-fluid">
          <div className="row">
            <div className="col">
              <form>
                <div className="row">
                  <div className="form-group col-sm-3">
                    <label>API provider</label>
                    <PonyfillSelector />
                  </div>
                  <div className="form-group col-sm-2">
                    <label>Region</label>
                    <RegionSelector />
                  </div>
                  <div className="form-group col">
                    <label>Subscription key</label>
                    <SubscriptionKeyInput />
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="row">
            <div className="col">
              {
                !!ponyfill &&
                  <SpeechRecognitionProvingGround
                    key={ ponyfill }
                    ponyfill={ ponyfill }
                  />
              }
            </div>
          </div>
          <GitHubForkMe owner="compulim" repo="web-speech-cognitive-services" />
        </div>
      </div>
    );
  }
}

export default connect(
  ({
    ponyfillType,
    region,
    subscriptionKey
  }) => ({
    ponyfillType,
    region,
    subscriptionKey
  })
)(App)
