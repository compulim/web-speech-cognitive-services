const SPEECH_SYNTHESIS_SPEAK_UTTERANCE = 'SPEECH_SYNTHESIS_SPEAK_UTTERANCE';

export default function ({ text, voiceURI }) {
  return {
    type: SPEECH_SYNTHESIS_SPEAK_UTTERANCE,
    payload: {
      utterance: {
        text,
        voiceURI
      }
    }
  };
}

export { SPEECH_SYNTHESIS_SPEAK_UTTERANCE }
