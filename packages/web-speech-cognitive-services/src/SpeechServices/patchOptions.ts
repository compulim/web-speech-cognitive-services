import { type AudioConfig } from 'microsoft-cognitiveservices-speech-sdk';
import resolveFunctionOrReturnValue from './resolveFunctionOrReturnValue';

let shouldWarnOnSubscriptionKey = true;

export type Credentials = Readonly<
  (
    | { authorizationToken: string; subscriptionKey?: undefined }
    | { authorizationToken?: undefined; subscriptionKey: string }
  ) &
    (
      | {
          customVoiceHostname?: undefined;
          region: string;
          speechRecognitionHostname?: undefined;
          speechSynthesisHostname?: undefined;
        }
      | {
          customVoiceHostname: string;
          region?: undefined;
          speechRecognitionHostname: string;
          speechSynthesisHostname: string;
        }
    )
>;

export type PatchOptionsInit = {
  audioConfig: AudioConfig;
  credentials?: (() => Credentials | Promise<Credentials>) | Credentials | Promise<Credentials>;
  enableTelemetry: boolean;
  looseEvent?: boolean | undefined;
  looseEvents?: boolean | undefined;
  referenceGrammars?: readonly string[] | undefined;
  region?: string | undefined;
  speechRecognitionEndpointId: string;
  textNormalization: 'display' | 'itn' | 'lexical' | 'maskeditn';
} & (
  | {
      authorizationToken: string;
      subscriptionKey?: undefined;
    }
  | {
      authorizationToken?: undefined;
      subscriptionKey: string;
    }
);

type PatchedOptions = Readonly<{
  audioConfig: AudioConfig;
  enableTelemetry: boolean;
  fetchCredentials: () => Promise<Credentials>;
  looseEvents: boolean;
  referenceGrammars: readonly string[] | undefined;
  speechRecognitionEndpointId: string | undefined;
  textNormalization: 'display' | 'itn' | 'lexical' | 'maskeditn';
}>;

export default function patchOptions(init: PatchOptionsInit): PatchedOptions {
  const {
    audioConfig,
    authorizationToken,
    enableTelemetry,
    looseEvent,
    referenceGrammars,
    region = 'westus',
    speechRecognitionEndpointId,
    subscriptionKey,
    textNormalization
  } = init;

  let { credentials, looseEvents } = init;

  if (typeof looseEvent !== 'undefined') {
    console.warn('web-speech-cognitive-services: The option "looseEvent" should be named as "looseEvents".');

    looseEvents = looseEvent;
  }

  if (!credentials) {
    if (!authorizationToken && !subscriptionKey) {
      throw new Error('web-speech-cognitive-services: Credentials must be specified.');
    } else {
      console.warn(
        'web-speech-cognitive-services: We are deprecating authorizationToken, region, and subscriptionKey. Please use credentials instead. The deprecated option will be removed on or after 2020-11-14.'
      );

      credentials = async () =>
        typeof init.authorizationToken !== 'undefined'
          ? { authorizationToken: await resolveFunctionOrReturnValue<string>(init.authorizationToken), region }
          : { region, subscriptionKey: await resolveFunctionOrReturnValue<string>(init.subscriptionKey) };
    }
  }

  return Object.freeze({
    audioConfig,
    enableTelemetry,
    fetchCredentials: async () => {
      const {
        authorizationToken,
        customVoiceHostname,
        region,
        speechRecognitionHostname,
        speechSynthesisHostname,
        subscriptionKey
      } = await resolveFunctionOrReturnValue<Credentials>(credentials);

      if ((!authorizationToken && !subscriptionKey) || (authorizationToken && subscriptionKey)) {
        throw new Error(
          'web-speech-cognitive-services: Either "authorizationToken" or "subscriptionKey" must be provided.'
        );
      } else if (!region && !(speechRecognitionHostname && speechSynthesisHostname)) {
        throw new Error(
          'web-speech-cognitive-services: Either "region" or "speechRecognitionHostname" and "speechSynthesisHostname" must be set.'
        );
      } else if (region && (customVoiceHostname || speechRecognitionHostname || speechSynthesisHostname)) {
        throw new Error(
          'web-speech-cognitive-services: Only either "region" or "customVoiceHostname", "speechRecognitionHostname" and "speechSynthesisHostname" can be set.'
        );
      } else if (authorizationToken) {
        if (typeof authorizationToken !== 'string') {
          throw new Error('web-speech-cognitive-services: "authorizationToken" must be a string.');
        }
      } else if (typeof subscriptionKey !== 'string') {
        throw new Error('web-speech-cognitive-services: "subscriptionKey" must be a string.');
      }

      if (shouldWarnOnSubscriptionKey && subscriptionKey) {
        console.warn(
          'web-speech-cognitive-services: In production environment, subscription key should not be used, authorization token should be used instead.'
        );

        shouldWarnOnSubscriptionKey = false;
      }

      return {
        ...(typeof authorizationToken !== 'undefined' ? { authorizationToken } : { subscriptionKey }),
        ...(typeof region !== 'undefined'
          ? { region }
          : {
              customVoiceHostname,
              speechRecognitionHostname,
              speechSynthesisHostname
            })
      } satisfies Credentials;
    },
    looseEvents: !!looseEvents,
    referenceGrammars: referenceGrammars && Object.freeze([...referenceGrammars]),
    speechRecognitionEndpointId,
    textNormalization
  });
}
