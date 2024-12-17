const SET_REGION = 'SET_REGION' as const;

export type SetRegionAction = Readonly<{
  payload: Readonly<{ region: string }>;
  type: typeof SET_REGION;
}>;

export default function setRegion(region: SetRegionAction['payload']['region']): SetRegionAction {
  return {
    payload: Object.freeze({ region }),
    type: SET_REGION
  };
}

export { SET_REGION };
