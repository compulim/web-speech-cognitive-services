const SET_PONYFILL_TYPE = 'SET_PONYFILL_TYPE';

export type SetPonyfillTypeAction = Readonly<{
  payload: Readonly<{ ponyfillType: string }>;
  type: typeof SET_PONYFILL_TYPE;
}>;

export default function setPonyfillType(
  ponyfillType: SetPonyfillTypeAction['payload']['ponyfillType']
): SetPonyfillTypeAction {
  return {
    payload: Object.freeze({ ponyfillType }),
    type: SET_PONYFILL_TYPE
  };
}

export { SET_PONYFILL_TYPE };
