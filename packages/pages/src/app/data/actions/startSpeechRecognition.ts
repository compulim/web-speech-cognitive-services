const START_SPEECH_RECOGNITION = 'START_SPEECH_RECOGNITION' as const;

export type StartSpeechRecognitionAction = Readonly<{ type: typeof START_SPEECH_RECOGNITION }>;

export default function startSpeechRecognition(): StartSpeechRecognitionAction {
  return Object.freeze({ type: START_SPEECH_RECOGNITION });
}

export { START_SPEECH_RECOGNITION };
