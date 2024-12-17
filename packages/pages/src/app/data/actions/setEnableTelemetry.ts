const SET_ENABLE_TELEMETRY = 'SET_ENABLE_TELEMETRY' as const;

export type SetEnableTelemetryAction = Readonly<{
  payload: Readonly<{ enableTelemetry: boolean }>;
  type: typeof SET_ENABLE_TELEMETRY;
}>;

export default function setEnableTelemetry(
  enableTelemetry: SetEnableTelemetryAction['payload']['enableTelemetry']
): SetEnableTelemetryAction {
  return Object.freeze({
    payload: Object.freeze({ enableTelemetry }),
    type: SET_ENABLE_TELEMETRY
  });
}

export { SET_ENABLE_TELEMETRY };
