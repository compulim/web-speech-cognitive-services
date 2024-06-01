import { SET_NAV_PANE } from '../actions/setNavPane';

export default function navPane(state = 'speech recognition', { payload, type }) {
  if (type === SET_NAV_PANE) {
    return payload.navPane;
  }

  return state;
}
