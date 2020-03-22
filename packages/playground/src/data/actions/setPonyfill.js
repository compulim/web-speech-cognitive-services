const SET_PONYFILL = 'SET_PONYFILL';

export default function setPonyfill(ponyfill) {
  return {
    type: SET_PONYFILL,
    payload: { ponyfill }
  };
}

export { SET_PONYFILL };
