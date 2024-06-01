import { SET_SPEECH_SYNTHESIS_OUTPUT_FORMAT } from '../actions/setSpeechSynthesisOutputFormat';

export default function speechSynthesisOutputFormat(state = 'audio-24khz-160kbitrate-mono-mp3', { payload, type }) {
  if (type === SET_SPEECH_SYNTHESIS_OUTPUT_FORMAT) {
    return payload.outputFormat;
  }

  return state;
}
