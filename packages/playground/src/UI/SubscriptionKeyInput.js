import { useSelector } from 'react-redux';
import classNames from 'classnames';
import React from 'react';

import convertBingSpeechSubscriptionKeyToAuthorizationToken from '../data/actions/convertBingSpeechSubscriptionKeyToAuthorizationToken';
import convertSpeechServicesSubscriptionKeyToAuthorizationToken from '../data/actions/convertSpeechServicesSubscriptionKeyToAuthorizationToken';
import setBingSpeechAuthorizationToken from '../data/actions/setBingSpeechAuthorizationToken';
import setBingSpeechSubscriptionKey from '../data/actions/setBingSpeechSubscriptionKey';
import setOnDemandAuthorizationToken from '../data/actions/setOnDemandAuthorizationToken';
import setSpeechServicesAuthorizationToken from '../data/actions/setSpeechServicesAuthorizationToken';
import setSpeechServicesSubscriptionKey from '../data/actions/setSpeechServicesSubscriptionKey';
import useDispatchAction from '../useDispatchAction';

const SubscriptionKeyInput = () => {
  const {
    authorizationToken,
    disabled,
    onDemandAuthorizationToken,
    ponyfillType,
    subscriptionKey
  } = useSelector(({
    bingSpeechAuthorizationToken,
    bingSpeechSubscriptionKey,
    onDemandAuthorizationToken,
    ponyfillType,
    speechServicesAuthorizationToken,
    speechServicesSubscriptionKey
  }) => ({
    authorizationToken: ponyfillType === 'bingspeech' ? bingSpeechAuthorizationToken : speechServicesAuthorizationToken,
    disabled: ponyfillType === 'browser',
    onDemandAuthorizationToken,
    ponyfillType,
    subscriptionKey: ponyfillType === 'bingspeech' ? bingSpeechSubscriptionKey : speechServicesSubscriptionKey
  }));

  const dispatchSetOnDemandAuthorizationToken = useDispatchAction(setOnDemandAuthorizationToken);

  const dispatchClearAuthorizationToken = useDispatchAction(
    ponyfillType === 'bingspeech' ?
      () => setBingSpeechAuthorizationToken('')
    :
      () => setSpeechServicesAuthorizationToken(''),
    [ponyfillType]
  );

  const dispatchConvertSubscriptionKeyToAuthorizationToken = useDispatchAction(
    ponyfillType === 'bingspeech' ?
      convertBingSpeechSubscriptionKeyToAuthorizationToken
    :
      convertSpeechServicesSubscriptionKeyToAuthorizationToken,
    [ponyfillType]
  );

  const dispatchSetSubscriptionKey = useDispatchAction(
    ponyfillType === 'bingspeech' ?
      ({ target: { value } }) => setBingSpeechSubscriptionKey(value)
    :
      ({ target: { value } }) => setSpeechServicesSubscriptionKey(value),
    [ponyfillType]
  );

  return (
    <div className="input-group">
      {
        authorizationToken ?
          <React.Fragment>
            <input
              className="form-control"
              disabled={ disabled }
              readOnly={ true }
              type="text"
              value={ authorizationToken }
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-secondary"
                onClick={ dispatchClearAuthorizationToken }
                type="button"
              >Clear</button>
            </div>
          </React.Fragment>
        :
          <React.Fragment>
            <input
              className="form-control"
              disabled={ disabled }
              onChange={ dispatchSetSubscriptionKey }
              type="text"
              value={ subscriptionKey }
            />
            <div className="input-group-append">
              <button
                className={ classNames('btn btn-outline-secondary', { active: onDemandAuthorizationToken }) }
                disabled={ disabled }
                onClick={ dispatchSetOnDemandAuthorizationToken }
                type="button"
              >On-demand</button>
              <button
                className="btn btn-outline-secondary"
                disabled={ disabled }
                onClick={ dispatchConvertSubscriptionKeyToAuthorizationToken }
                type="button"
              >Convert to authorization token</button>
            </div>
          </React.Fragment>
      }
    </div>
  );
}

export default SubscriptionKeyInput
