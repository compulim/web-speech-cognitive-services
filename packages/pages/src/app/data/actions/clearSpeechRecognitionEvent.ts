const CLEAR_SPEECH_RECOGNITION_EVENT = 'CLEAR_SPEECH_RECOGNITION_EVENT' as const;

export type ClearSpeechRecognitionEventAction = Readonly<{ type: typeof CLEAR_SPEECH_RECOGNITION_EVENT }>;

export default function clearSpeechRecognitionEvent(): ClearSpeechRecognitionEventAction {
  return Object.freeze({ type: CLEAR_SPEECH_RECOGNITION_EVENT });
}

export { CLEAR_SPEECH_RECOGNITION_EVENT };
