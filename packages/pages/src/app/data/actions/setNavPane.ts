const SET_NAV_PANE = 'SET_NAV_PANE' as const;

export type SetNavPaneAction = Readonly<{
  payload: Readonly<{ navPane: string }>;
  type: typeof SET_NAV_PANE;
}>;

export default function setNavPane(navPane: SetNavPaneAction['payload']['navPane']): SetNavPaneAction {
  if (navPane !== 'speech synthesis') {
    navPane = 'speech recognition';
  }

  return {
    payload: Object.freeze({ navPane }),
    type: SET_NAV_PANE
  };
}

export { SET_NAV_PANE };
