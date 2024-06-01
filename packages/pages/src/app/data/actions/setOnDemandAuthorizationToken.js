const SET_ON_DEMAND_AUTHORIZATION_TOKEN = 'SET_ON_DEMAND_AUTHORIZATION_TOKEN';

export default function setOnDemandAuthorizationToken(onDemand) {
  return {
    type: SET_ON_DEMAND_AUTHORIZATION_TOKEN,
    payload: { onDemand }
  };
}

export { SET_ON_DEMAND_AUTHORIZATION_TOKEN };
