import { SET_NAV_PANE, type SetNavPaneAction } from '../actions/setNavPane';

export default function navPane(state = 'speech recognition', { payload, type }: SetNavPaneAction): string {
  if (type === SET_NAV_PANE) {
    return payload.navPane;
  }

  return state;
}
