const SET_REGION = 'SET_REGION';

export default function setRegion(region) {
  return {
    type: SET_REGION,
    payload: { region }
  };
}

export { SET_REGION };
