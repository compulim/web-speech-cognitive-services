/* eslint react-hooks/exhaustive-deps: "off" */

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

export default function useDispatchAction(fn, deps = []) {
  const dispatch = useDispatch();

  return useCallback(value => dispatch(fn(value)), [dispatch, fn, ...deps]);
}
