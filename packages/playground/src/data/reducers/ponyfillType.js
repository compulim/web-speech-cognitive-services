import { SET_PONYFILL_TYPE } from '../actions/setPonyfillType';

export default function (state = 'cognitiveservices', { payload, type }) {
  if (type === SET_PONYFILL_TYPE) {
    switch (payload.ponyfillType) {
      case 'both':
        state = 'both';
        break;

      case 'cognitiveservices':
        state = 'cognitiveservices';
        break;

      default:
        state = 'browser';
        break;
    }
  }

  return state;
}
