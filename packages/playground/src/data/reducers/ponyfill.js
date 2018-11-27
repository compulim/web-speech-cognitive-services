import { SET_PONYFILL } from '../actions/setPonyfill';

export default function (state = null, { payload, type }) {
  if (type === SET_PONYFILL) {
    return payload.ponyfill;
  }

  return state;
}
