const SET_PONYFILL = 'SET_PONYFILL' as const;

export type SetPonyfillAction = Readonly<{
  payload: Readonly<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ponyfill: any;
  }>;
  type: typeof SET_PONYFILL;
}>;

export default function setPonyfill(ponyfill: SetPonyfillAction['payload']['ponyfill']): SetPonyfillAction {
  return Object.freeze({
    payload: Object.freeze({ ponyfill }),
    type: SET_PONYFILL
  });
}

export { SET_PONYFILL };
