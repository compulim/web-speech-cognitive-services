import { connect } from 'react-redux';
import React from 'react';

import convertBingSpeechSubscriptionKeyToAuthorizationToken from '../data/actions/convertBingSpeechSubscriptionKeyToAuthorizationToken';
import convertSpeechServicesSubscriptionKeyToAuthorizationToken from '../data/actions/convertSpeechServicesSubscriptionKeyToAuthorizationToken';
import setBingSpeechAuthorizationToken from '../data/actions/setBingSpeechAuthorizationToken';
import setBingSpeechSubscriptionKey from '../data/actions/setBingSpeechSubscriptionKey';
import setSpeechServicesAuthorizationToken from '../data/actions/setSpeechServicesAuthorizationToken';
import setSpeechServicesSubscriptionKey from '../data/actions/setSpeechServicesSubscriptionKey';

const SubscriptionKeyInput = ({
  authorizationToken,
  clearAuthorizationToken,
  convertSubscriptionKeyToAuthorizationToken,
  disabled,
  setSubscriptionKey,
  subscriptionKey
}) =>
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
              onClick={ clearAuthorizationToken }
              type="button"
            >Clear</button>
          </div>
        </React.Fragment>
      :
        <React.Fragment>
          <input
            className="form-control"
            disabled={ disabled }
            onChange={ setSubscriptionKey }
            type="text"
            value={ subscriptionKey }
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-secondary"
              disabled={ disabled }
              onClick={ convertSubscriptionKeyToAuthorizationToken }
              type="button"
            >Convert to authorization token</button>
          </div>
        </React.Fragment>
    }
  </div>

export default connect(
  ({
    bingSpeechAuthorizationToken,
    bingSpeechSubscriptionKey,
    ponyfillType,
    speechServicesAuthorizationToken,
    speechServicesSubscriptionKey
  }) => ({
    authorizationToken: ponyfillType === 'bingspeech' ? bingSpeechAuthorizationToken : speechServicesAuthorizationToken,
    disabled: ponyfillType === 'browser',
    ponyfillType,
    subscriptionKey: ponyfillType === 'bingspeech' ? bingSpeechSubscriptionKey : speechServicesSubscriptionKey
  }),
  {
    clearBingSpeechAuthorizationToken: () => setBingSpeechAuthorizationToken(''),
    clearSpeechServicesAuthorizationToken: () => setSpeechServicesAuthorizationToken(''),
    convertBingSpeechSubscriptionKeyToAuthorizationToken,
    convertSpeechServicesSubscriptionKeyToAuthorizationToken,
    setBingSpeechSubscriptionKey: ({ target: { value } }) => setBingSpeechSubscriptionKey(value),
    setSpeechServicesSubscriptionKey: ({ target: { value } }) => setSpeechServicesSubscriptionKey(value)
  },
  (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    clearAuthorizationToken:
      stateProps.ponyfillType === 'bingspeech' ?
        dispatchProps.clearBingSpeechAuthorizationToken
      :
        dispatchProps.clearSpeechServicesAuthorizationToken,
    convertSubscriptionKeyToAuthorizationToken:
      stateProps.ponyfillType === 'bingspeech' ?
        dispatchProps.convertBingSpeechSubscriptionKeyToAuthorizationToken
      :
        dispatchProps.convertSpeechServicesSubscriptionKeyToAuthorizationToken,
    setSubscriptionKey:
      stateProps.ponyfillType === 'bingspeech' ?
        dispatchProps.setBingSpeechSubscriptionKey
      :
        dispatchProps.setSpeechServicesSubscriptionKey
  })
)(SubscriptionKeyInput)
