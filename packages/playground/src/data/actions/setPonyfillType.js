const SET_PONYFILL_TYPE = 'SET_PONYFILL_TYPE';

export default function setPonyfillType(ponyfillType) {
  return {
    type: SET_PONYFILL_TYPE,
    payload: { ponyfillType }
  };
}

export { SET_PONYFILL_TYPE };
