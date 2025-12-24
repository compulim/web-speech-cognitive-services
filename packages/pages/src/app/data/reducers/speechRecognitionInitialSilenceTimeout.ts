import {
  type SetSpeechRecognitionInitialSilenceTimeoutAction,
  SET_SPEECH_RECOGNITION_INITIAL_SILENCE_TIMEOUT
} from '../actions/setSpeechRecognitionInitialSilenceTimeout.ts';

export default function speechRecognitionInitialSilenceTimeout(
  state: number | 'default' = 'default',
  { payload, type }: { type: string } & SetSpeechRecognitionInitialSilenceTimeoutAction
): 'default' | number {
  if (type === SET_SPEECH_RECOGNITION_INITIAL_SILENCE_TIMEOUT) {
    state = payload.initialSilenceTimeout;
  }

  return state;
}
