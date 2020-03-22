import { SET_ENABLE_TELEMETRY } from '../actions/setEnableTelemetry';

export default function enableTelemetry(state = true, { payload, type }) {
  if (type === SET_ENABLE_TELEMETRY) {
    return payload.enableTelemetry;
  }

  return state;
}
