import { SET_REGION } from '../actions/setRegion';

export default function region(state = 'westus', { payload, type }) {
  if (type === SET_REGION) {
    state = payload.region;
  }

  return state;
}
