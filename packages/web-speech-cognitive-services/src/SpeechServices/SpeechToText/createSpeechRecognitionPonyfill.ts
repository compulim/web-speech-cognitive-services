/* eslint class-methods-use-this: "off" */
/* eslint complexity: ["error", 70] */
/* eslint no-await-in-loop: "off" */
/* eslint no-empty-function: "off" */
/* eslint no-magic-numbers: ["error", { "ignore": [0, 100, 150] }] */

import { PropertyId } from 'microsoft-cognitiveservices-speech-sdk';
import patchOptions, { type PatchOptionsInit } from '../patchOptions';
import SpeechSDK from '../SpeechSDK';
import createSpeechRecognitionPonyfillFromRecognizer from './createSpeechRecognitionPonyfillFromRecognizer';

const { OutputFormat, SpeechConfig, SpeechRecognizer } = SpeechSDK;

export default function createSpeechRecognitionPonyfill(options: PatchOptionsInit) {
  const {
    audioConfig,
    enableTelemetry,
    fetchCredentials,
    initialSilenceTimeout,
    looseEvents,
    referenceGrammars,
    speechRecognitionEndpointId,
    textNormalization
  } = patchOptions(options);

  if (!audioConfig && (!window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia)) {
    throw new Error(
      'web-speech-cognitive-services: This browser does not support Media Capture and Streams API and it will not work with Cognitive Services Speech Services.'
    );
  }

  const createRecognizer = async (lang: string) => {
    const credentials = await fetchCredentials();
    let speechConfig;

    if (typeof credentials.speechRecognitionHostname !== 'undefined') {
      const host = new URL('wss://localhost:443');

      host.hostname = credentials.speechRecognitionHostname;

      if (credentials.authorizationToken) {
        speechConfig = SpeechConfig.fromHost(host);
        speechConfig.authorizationToken = credentials.authorizationToken;
      } else {
        speechConfig = SpeechConfig.fromHost(host, credentials.subscriptionKey);
      }
    } else {
      speechConfig =
        typeof credentials.authorizationToken !== 'undefined'
          ? SpeechConfig.fromAuthorizationToken(credentials.authorizationToken, credentials.region)
          : SpeechConfig.fromSubscription(credentials.subscriptionKey, credentials.region);
    }

    if (speechRecognitionEndpointId) {
      speechConfig.endpointId = speechRecognitionEndpointId;
    }

    speechConfig.outputFormat = OutputFormat.Detailed;
    speechConfig.speechRecognitionLanguage = lang || 'en-US';
    typeof initialSilenceTimeout === 'number' &&
      speechConfig.setProperty(PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, '' + initialSilenceTimeout);

    return new SpeechRecognizer(speechConfig, audioConfig);
  };

  return createSpeechRecognitionPonyfillFromRecognizer({
    createRecognizer,
    enableTelemetry,
    looseEvents,
    referenceGrammars,
    textNormalization
  });
}
