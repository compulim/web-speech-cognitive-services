const SPEECH_SYNTHESIS_SPEAK_UTTERANCE = 'SPEECH_SYNTHESIS_SPEAK_UTTERANCE';

export default function speechSynthesisSpeakUtterance(utterance) {
  return {
    type: SPEECH_SYNTHESIS_SPEAK_UTTERANCE,
    payload: { utterance }
  };
}

export { SPEECH_SYNTHESIS_SPEAK_UTTERANCE };
