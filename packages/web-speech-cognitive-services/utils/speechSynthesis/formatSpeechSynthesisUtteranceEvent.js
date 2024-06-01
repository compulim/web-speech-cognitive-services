export default function formatSpeechSynthesisUtteranceEvent(event) {
  const { type } = event;

  switch (type) {
    case 'boundary':
      return [type, { charIndex: event.charIndex, elapsedTime: event.elapsedTime, name: event.name }];

    case 'end':
    case 'pause':
    case 'resume':
      return [type, { elapsedTime: event.elapsedTime }];

    case 'error':
      // This must be either one of the following:
      // canceled, interrupted, audio-busy, audio-hardware, network, synthesis-unavailable, synthesis-failed, voice-unavailable, text-too-long, invalid-argument
      // https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisErrorEvent/error
      return [type, { error: event.error }];

    case 'mark':
      return [type, { name: event.name }];

    case 'start':
      return type;

    default:
      return;
  }
}
