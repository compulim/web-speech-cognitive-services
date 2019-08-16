import { css } from 'glamor';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import React from 'react';

import GitHubForkMe from './GitHubForkMe';

import PonyfillSelector from './UI/PonyfillSelector';
import RegionSelector from './UI/RegionSelector';
import SubscriptionKeyInput from './UI/SubscriptionKeyInput';
import SpeechRecognitionProvingGround from './SpeechRecognitionProvingGround2';
import SpeechSynthesisProvingGround from './SpeechSynthesisProvingGround';

import setNavPane from './data/actions/setNavPane';
import useDispatchAction from './useDispatchAction';

// Patching Bootstrap
css.global('button.nav-link', { backgroundColor: 'Transparent' });

const App = () => {
  const {
    authorizationToken,
    navPane,
    ponyfill,
    ponyfillType
  } = useSelector(({
    authorizationToken,
    navPane,
    ponyfill,
    ponyfillType
  }) => ({
    authorizationToken,
    navPane,
    ponyfill,
    ponyfillType
  }));

  const dispatchSetNavPaneToSpeechRecognition = useDispatchAction(event => {
    event.preventDefault();

    return setNavPane('speech recognition');
  });

  const dispatchSetNavPaneToSpeechSynthesis = useDispatchAction(event => {
    event.preventDefault();

    return setNavPane('speech synthesis');
  });

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
                  <label>{ authorizationToken ? 'Authorization token' : 'Subscription key' }</label>
                  <SubscriptionKeyInput />
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={ classNames('nav-link', { active: navPane === 'speech recognition' }) }
                  onClick={ dispatchSetNavPaneToSpeechRecognition }
                  type="button"
                >Speech recognition</button>
              </li>
              <li className="nav-item">
                <button
                  className={ classNames('nav-link', { active: navPane === 'speech synthesis' }) }
                  onClick={ dispatchSetNavPaneToSpeechSynthesis }
                  type="button"
                >Speech synthesis</button>
              </li>
            </ul>
            <br />
          </div>
        </div>
        <div className="row">
          <div className="col">
            {
              !!ponyfill && (
                navPane === 'speech synthesis' ?
                  <SpeechSynthesisProvingGround
                    key={ ponyfillType }
                    ponyfill={ ponyfill }
                  />
                :
                  <SpeechRecognitionProvingGround
                    key={ ponyfillType }
                    ponyfill={ ponyfill }
                  />
              )
            }
          </div>
        </div>
        <GitHubForkMe owner="compulim" repo="web-speech-cognitive-services" />
      </div>
    </div>
  );
}

export default App
