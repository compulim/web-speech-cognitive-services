import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import React, { useCallback } from 'react';

import convertSpeechServicesSubscriptionKeyToAuthorizationToken from '../data/actions/convertSpeechServicesSubscriptionKeyToAuthorizationToken.ts';
import getPonyfillCapabilities from '../getPonyfillCapabilities.js';
import setOnDemandAuthorizationToken from '../data/actions/setOnDemandAuthorizationToken.ts';
import setSpeechServicesAuthorizationToken from '../data/actions/setSpeechServicesAuthorizationToken.ts';
import setSpeechServicesSubscriptionKey from '../data/actions/setSpeechServicesSubscriptionKey.ts';

const SubscriptionKeyInput = () => {
  const { authorizationToken, disabled, onDemandAuthorizationToken, subscriptionKey } = useSelector(
    ({
      onDemandAuthorizationToken,
      ponyfillType,
      speechServicesAuthorizationToken,
      speechServicesSubscriptionKey
    }) => ({
      authorizationToken: speechServicesAuthorizationToken,
      disabled: getPonyfillCapabilities(ponyfillType).browser,
      onDemandAuthorizationToken,
      subscriptionKey: speechServicesSubscriptionKey
    })
  );

  const dispatch = useDispatch();
  const dispatchSetOnDemandAuthorizationToken = useCallback(
    value => dispatch(setOnDemandAuthorizationToken(value)),
    [dispatch]
  );

  const dispatchClearAuthorizationToken = useCallback(
    () => dispatch(setSpeechServicesAuthorizationToken('')),
    [dispatch]
  );

  const dispatchConvertSubscriptionKeyToAuthorizationToken = useCallback(
    () => dispatch(convertSpeechServicesSubscriptionKeyToAuthorizationToken()),
    [dispatch]
  );

  const dispatchSetSubscriptionKey = useCallback(
    ({ target: { value } }) => dispatch(setSpeechServicesSubscriptionKey(value)),
    [dispatch]
  );

  return (
    <div className="input-group">
      {authorizationToken ? (
        <React.Fragment>
          <input className="form-control" disabled={disabled} readOnly={true} type="text" value={authorizationToken} />
          <div className="input-group-append">
            <button className="btn btn-outline-secondary" onClick={dispatchClearAuthorizationToken} type="button">
              Clear
            </button>
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <input
            className="form-control"
            disabled={disabled}
            onChange={dispatchSetSubscriptionKey}
            type="text"
            value={subscriptionKey}
          />
          <div className="input-group-append">
            <button
              className={classNames('btn btn-outline-secondary', { active: onDemandAuthorizationToken })}
              disabled={disabled}
              onClick={dispatchSetOnDemandAuthorizationToken}
              type="button"
            >
              On-demand
            </button>
            <button
              className="btn btn-outline-secondary"
              disabled={disabled}
              onClick={dispatchConvertSubscriptionKeyToAuthorizationToken}
              type="button"
            >
              Convert to authorization token
            </button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default SubscriptionKeyInput;
