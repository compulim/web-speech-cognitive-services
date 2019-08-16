const SET_SPEECH_SYNTHESIS_OUTPUT_FORMAT = 'SET_SPEECH_SYNTHESIS_OUTPUT_FORMAT';

export default function (outputFormat) {
  return {
    type: SET_SPEECH_SYNTHESIS_OUTPUT_FORMAT,
    payload: { outputFormat }
  };
}

export { SET_SPEECH_SYNTHESIS_OUTPUT_FORMAT }
