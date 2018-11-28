import { connect } from 'react-redux';
import React from 'react';

import convertSubscriptionKeyToAuthorizationToken from '../data/actions/convertSubscriptionKeyToAuthorizationToken';
import setAuthorizationToken from '../data/actions/setAuthorizationToken';
import setSubscriptionKey from '../data/actions/setSubscriptionKey';

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
              onClick={ convertSubscriptionKeyToAuthorizationToken }
              type="button"
            >Convert to authorization token</button>
          </div>
        </React.Fragment>
    }
  </div>

export default connect(
  ({
    authorizationToken,
    ponyfillType,
    subscriptionKey
  }) => ({
    authorizationToken,
    disabled: ponyfillType === 'browser',
    subscriptionKey
  }),
  {
    clearAuthorizationToken: () => setAuthorizationToken(''),
    convertSubscriptionKeyToAuthorizationToken,
    setSubscriptionKey: ({ target: { value } }) => setSubscriptionKey(value)
  }
)(SubscriptionKeyInput)
