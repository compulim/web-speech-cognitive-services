import { SET_ON_DEMAND_AUTHORIZATION_TOKEN } from '../actions/setOnDemandAuthorizationToken';

export default function onDemandAuthorizationToken(state = false, { payload, type }) {
  if (type === SET_ON_DEMAND_AUTHORIZATION_TOKEN) {
    if (typeof payload.onDemand === 'boolean') {
      state = payload.onDemand;
    } else {
      state = !state;
    }
  }

  return state;
}
