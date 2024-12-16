import {
  type SpeechRecognitionInitialSilenceTimeoutAction,
  SET_SPEECH_RECOGNITION_INITIAL_SILENCE_TIMEOUT
} from '../actions/setSpeechRecognitionInitialSilenceTimeout';

export default function speechRecognitionInitialSilenceTimeout(
  state: number | 'default' = 'default',
  { payload, type }: { type: string } & SpeechRecognitionInitialSilenceTimeoutAction
): 'default' | number {
  if (type === SET_SPEECH_RECOGNITION_INITIAL_SILENCE_TIMEOUT) {
    state = payload.initialSilenceTimeout;
  }

  return state;
}
