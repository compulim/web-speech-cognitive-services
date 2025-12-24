import { SET_ENABLE_TELEMETRY, type SetEnableTelemetryAction } from '../actions/setEnableTelemetry.ts';

export default function enableTelemetry(state = true, { payload, type }: SetEnableTelemetryAction): boolean {
  if (type === SET_ENABLE_TELEMETRY) {
    return payload.enableTelemetry;
  }

  return state;
}
