import { SET_PONYFILL_TYPE } from '../actions/setPonyfillType';

export default function (state = 'speechservices', { payload, type }) {
  if (type === SET_PONYFILL_TYPE) {
    switch (payload.ponyfillType) {
      case 'bingspeech':
        state = 'bingspeech';
        break;

      case 'speechservices':
        state = 'speechservices';
        break;

      default:
        state = 'browser';
        break;
    }
  }

  return state;
}
