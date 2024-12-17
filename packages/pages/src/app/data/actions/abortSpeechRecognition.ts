const ABORT_SPEECH_RECOGNITION = 'ABORT_SPEECH_RECOGNITION' as const;

export type AbortSpeechRecognitionAction = Readonly<{ type: typeof ABORT_SPEECH_RECOGNITION }>;

export default function abortSpeechRecognition(): AbortSpeechRecognitionAction {
  return { type: ABORT_SPEECH_RECOGNITION };
}

export { ABORT_SPEECH_RECOGNITION };
