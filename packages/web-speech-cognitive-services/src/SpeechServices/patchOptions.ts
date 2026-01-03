import { type AudioConfig as AudioConfigType } from 'microsoft-cognitiveservices-speech-sdk';
import { parse } from 'valibot';

import resolveFunctionOrReturnValue from './resolveFunctionOrReturnValue.ts';
import SpeechSDK from './SpeechSDK.ts';
import credentialsSchema, { type Credentials } from './SpeechToText/validation/credentialsSchema.ts';
import enableTelemetrySchema, { type EnableTelemetry } from './SpeechToText/validation/enableTelemetrySchema.ts';
import initialSilenceTimeoutSchema, {
  type InitialSilenceTimeout
} from './SpeechToText/validation/initialSilenceTimeoutSchema.ts';
import looseEventsSchema, { type LooseEvents } from './SpeechToText/validation/looseEventsSchema.ts';
import referenceGrammarsSchema, { type ReferenceGrammars } from './SpeechToText/validation/referenceGrammarsSchema.ts';
import speechRecognitionEndpointIdSchema, {
  type SpeechRecognitionEndpointId
} from './SpeechToText/validation/speechRecognitionEndpointIdSchema.ts';
import textNormalizationSchema, { type TextNormalization } from './SpeechToText/validation/textNormalizationSchema.ts';

const { AudioConfig } = SpeechSDK;

let shouldWarnOnSubscriptionKey = true;

type PatchOptionsInit = {
  audioConfig?: AudioConfigType | undefined;
  credentials: (() => Credentials | Promise<Credentials>) | Credentials | Promise<Credentials>;
  enableTelemetry?: boolean | undefined;
  initialSilenceTimeout?: number | undefined;
  looseEvent?: boolean | undefined;
  looseEvents?: boolean | undefined;
  referenceGrammars?: readonly string[] | undefined;
  speechRecognitionEndpointId?: string | undefined;
  textNormalization?: 'display' | 'itn' | 'lexical' | 'maskeditn' | undefined;
};

type PatchedOptions = Readonly<{
  audioConfig: AudioConfigType;
  enableTelemetry: EnableTelemetry;
  fetchCredentials: () => Promise<Credentials>;
  initialSilenceTimeout: InitialSilenceTimeout;
  looseEvents: LooseEvents;
  referenceGrammars: ReferenceGrammars;
  speechRecognitionEndpointId: SpeechRecognitionEndpointId;
  textNormalization: TextNormalization;
}>;

export default function patchOptions(init: PatchOptionsInit): PatchedOptions {
  const {
    audioConfig,
    credentials,
    enableTelemetry,
    initialSilenceTimeout,
    looseEvent,
    referenceGrammars,
    speechRecognitionEndpointId,
    textNormalization
  } = init;

  let { looseEvents } = init;

  if (typeof looseEvent !== 'undefined') {
    console.warn('web-speech-cognitive-services: The option "looseEvent" should be named as "looseEvents".');

    looseEvents = looseEvent;
  }

  return Object.freeze({
    audioConfig: audioConfig || AudioConfig.fromDefaultMicrophoneInput(),
    // We set telemetry to true to honor the default telemetry settings of Speech SDK
    // https://github.com/Microsoft/cognitive-services-speech-sdk-js#data--telemetry
    enableTelemetry: parse(enableTelemetrySchema, enableTelemetry),
    fetchCredentials: async () => {
      const parsedCredentials = parse(credentialsSchema, await resolveFunctionOrReturnValue<Credentials>(credentials));

      if (shouldWarnOnSubscriptionKey && parsedCredentials.subscriptionKey) {
        console.warn(
          'web-speech-cognitive-services: In production environment, subscription key should not be used, authorization token should be used instead.'
        );

        shouldWarnOnSubscriptionKey = false;
      }

      return parsedCredentials;
    },
    initialSilenceTimeout: parse(initialSilenceTimeoutSchema, initialSilenceTimeout),
    looseEvents: parse(looseEventsSchema, looseEvents),
    referenceGrammars: parse(referenceGrammarsSchema, referenceGrammars),
    speechRecognitionEndpointId: parse(speechRecognitionEndpointIdSchema, speechRecognitionEndpointId),
    textNormalization: parse(textNormalizationSchema, textNormalization)
  });
}

export type { Credentials, PatchedOptions, PatchOptionsInit };
