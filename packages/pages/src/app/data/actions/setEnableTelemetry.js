const SET_ENABLE_TELEMETRY = 'SET_ENABLE_TELEMETRY';

export default function setEnableTelemetry(enableTelemetry) {
  return {
    type: SET_ENABLE_TELEMETRY,
    payload: { enableTelemetry }
  };
}

export { SET_ENABLE_TELEMETRY };
