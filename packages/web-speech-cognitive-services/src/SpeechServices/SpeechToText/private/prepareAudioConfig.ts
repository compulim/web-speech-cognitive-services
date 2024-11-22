import { AudioSourceEvent } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/AudioSourceEvents';
import {
  type AudioConfig,
  type AudioConfigImpl
} from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Audio/AudioConfig';
import averageAmplitude from './averageAmplitude';

export default function prepareAudioConfig(audioConfig: AudioConfig) {
  // Speech SDK also force cast AudioConfig to AudioConfigImpl and pass it to ServiceRecognizerBase to use attach() and other methods.
  // https://github.com/microsoft/cognitive-services-speech-sdk-js/blob/a6e9d2a202534565ccc97650861a6b296de48ecf/src/sdk/SpeechRecognizer.ts#L291C27-L291C43
  const audioConfigImpl = audioConfig as AudioConfigImpl;
  const originalAttach = audioConfigImpl.attach;
  const boundOriginalAttach = audioConfigImpl.attach.bind(audioConfigImpl);
  let firstChunk = false;
  let muted = false;

  // We modify "attach" function and detect when audible chunk is read.
  // We will only modify "attach" function once.
  audioConfigImpl.attach = async () => {
    const reader = await boundOriginalAttach('');

    return {
      ...reader,
      read: async () => {
        const chunk = await reader.read();

        // The magic number 150 is measured by:
        // 1. Set microphone volume to 0
        // 2. Observe the amplitude (100-110) for the first few chunks
        //    (There is a short static caught when turning on the microphone)
        // 3. Set the number a bit higher than the observation
        if (!firstChunk && averageAmplitude(chunk.buffer) > 150) {
          audioConfigImpl.events.onEvent(new AudioSourceEvent('FirstAudibleChunk', ''));
          firstChunk = true;
        }

        if (muted) {
          return { buffer: new ArrayBuffer(0), isEnd: true, timeReceived: Date.now() };
        }

        return chunk;
      }
    };
  };

  return {
    audioConfig,
    pause: () => {
      muted = true;
    },
    unprepare: () => {
      audioConfigImpl.attach = originalAttach;
    }
  };
}
