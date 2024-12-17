const SET_ON_DEMAND_AUTHORIZATION_TOKEN = 'SET_ON_DEMAND_AUTHORIZATION_TOKEN' as const;

export type SetOnDemandAuthorizationTokenAction = Readonly<{
  payload: Readonly<{ onDemand: boolean }>;
  type: typeof SET_ON_DEMAND_AUTHORIZATION_TOKEN;
}>;

export default function setOnDemandAuthorizationToken(
  onDemand: SetOnDemandAuthorizationTokenAction['payload']['onDemand']
): SetOnDemandAuthorizationTokenAction {
  return {
    payload: Object.freeze({ onDemand }),
    type: SET_ON_DEMAND_AUTHORIZATION_TOKEN
  };
}

export { SET_ON_DEMAND_AUTHORIZATION_TOKEN };
