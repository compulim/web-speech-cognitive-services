import { SET_PONYFILL } from '../actions/setPonyfill.ts';

export default function ponyfill(state = null, { payload, type }) {
  if (type === SET_PONYFILL) {
    return payload.ponyfill;
  }

  return state;
}
