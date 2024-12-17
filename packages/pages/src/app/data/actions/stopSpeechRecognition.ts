const STOP_SPEECH_RECOGNITION = 'STOP_SPEECH_RECOGNITION' as const;

export type StopSpeechRecognitionAction = Readonly<{ type: typeof STOP_SPEECH_RECOGNITION }>;

export default function stopSpeechRecognition(): StopSpeechRecognitionAction {
  return { type: STOP_SPEECH_RECOGNITION };
}

export { STOP_SPEECH_RECOGNITION };
