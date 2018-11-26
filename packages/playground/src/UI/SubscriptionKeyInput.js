import { connect } from 'react-redux';
import React from 'react';

import setSubscriptionKey from '../data/actions/setSubscriptionKey';

const SubscriptionKeyInput = ({
  disabled,
  setSubscriptionKey,
  subscriptionKey
}) =>
  <input
    className="form-control"
    disabled={ disabled }
    onChange={ setSubscriptionKey }
    type="text"
    value={ subscriptionKey }
  />

export default connect(
  ({
    ponyfillType,
    subscriptionKey
  }) => ({
    disabled: ponyfillType === 'browser',
    subscriptionKey
  }),
  { setSubscriptionKey: ({ target: { value } }) => setSubscriptionKey(value) }
)(SubscriptionKeyInput)
