const SET_REGION = 'SET_REGION';

export default function (region) {
  return {
    type: SET_REGION,
    payload: { region }
  };
}

export { SET_REGION }
