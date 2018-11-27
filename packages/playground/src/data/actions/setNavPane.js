const SET_NAV_PANE = 'SET_NAV_PANE';

export default function (navPane) {
  if (navPane !== 'speech synthesis') {
    navPane = 'speech recognition';
  }

  return {
    type: SET_NAV_PANE,
    payload: { navPane }
  };
}

export { SET_NAV_PANE }
