/* eslint class-methods-use-this: "off" */
/* eslint complexity: ["error", 70] */
/* eslint no-await-in-loop: "off" */
/* eslint no-empty-function: "off" */
/* eslint no-magic-numbers: ["error", { "ignore": [0, 100, 150] }] */

import patchOptions from '../patchOptions';
import SpeechSDK from '../SpeechSDK';
import createSpeechRecognitionPonyfillFromRecognizer from './createSpeechRecognitionPonyfillFromRecognizer';

const { AudioConfig, OutputFormat, SpeechConfig, SpeechRecognizer } = SpeechSDK;

export default function createSpeechRecognitionPonyfill(options) {
  const {
    audioConfig = AudioConfig.fromDefaultMicrophoneInput(),

    // We set telemetry to true to honor the default telemetry settings of Speech SDK
    // https://github.com/Microsoft/cognitive-services-speech-sdk-js#data--telemetry
    enableTelemetry = true,

    fetchCredentials,
    looseEvents,
    referenceGrammars,
    speechRecognitionEndpointId,
    textNormalization = 'display'
  } = patchOptions(options);

  if (!audioConfig && (!window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia)) {
    console.warn(
      'web-speech-cognitive-services: This browser does not support WebRTC and it will not work with Cognitive Services Speech Services.'
    );

    return {};
  }

  const createRecognizer = async lang => {
    const { authorizationToken, region, speechRecognitionHostname, subscriptionKey } = await fetchCredentials();
    let speechConfig;

    if (speechRecognitionHostname) {
      const host = { hostname: speechRecognitionHostname, port: 443, protocol: 'wss:' };

      if (authorizationToken) {
        speechConfig = SpeechConfig.fromHost(host);
        speechConfig.authorizationToken = authorizationToken;
      } else {
        speechConfig = SpeechConfig.fromHost(host, subscriptionKey);
      }
    } else {
      speechConfig = authorizationToken
        ? SpeechConfig.fromAuthorizationToken(authorizationToken, region)
        : SpeechConfig.fromSubscription(subscriptionKey, region);
    }

    if (speechRecognitionEndpointId) {
      speechConfig.endpointId = speechRecognitionEndpointId;
    }

    speechConfig.outputFormat = OutputFormat.Detailed;
    speechConfig.speechRecognitionLanguage = lang || 'en-US';
    // speechConfig.setProperty(PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, '2000');
    // speechConfig.setProperty(PropertyId.Conversation_Initial_Silence_Timeout, '2000');
    // speechConfig.setProperty(PropertyId.Speech_SegmentationSilenceTimeoutMs, '2000');

    return new SpeechRecognizer(speechConfig, audioConfig);
  };

  return createSpeechRecognitionPonyfillFromRecognizer({
    audioConfig,
    createRecognizer,
    enableTelemetry,
    looseEvents,
    referenceGrammars,
    textNormalization
  });
}
