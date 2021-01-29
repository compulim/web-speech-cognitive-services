import { put, select, takeLatest } from 'redux-saga/effects';
import createSpeechServicesPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

import { SET_ENABLE_TELEMETRY } from '../actions/setEnableTelemetry';
import { SET_ON_DEMAND_AUTHORIZATION_TOKEN } from '../actions/setOnDemandAuthorizationToken';
import { SET_PONYFILL_TYPE } from '../actions/setPonyfillType';
import { SET_REGION } from '../actions/setRegion';
import { SET_SPEECH_RECOGNITION_ENDPOINT_ID } from '../actions/setSpeechRecognitionEndpointId';
import { SET_SPEECH_RECOGNITION_REFERENCE_GRAMMARS } from '../actions/setSpeechRecognitionReferenceGrammars';
import { SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION } from '../actions/setSpeechRecognitionTextNormalization';
import { SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN } from '../actions/setSpeechServicesAuthorizationToken';
import { SET_SPEECH_SERVICES_SUBSCRIPTION_KEY } from '../actions/setSpeechServicesSubscriptionKey';
import { SET_SPEECH_SYNTHESIS_DEPLOYMENT_ID } from '../actions/setSpeechSynthesisDeploymentId';
import { SET_SPEECH_SYNTHESIS_OUTPUT_FORMAT } from '../actions/setSpeechSynthesisOutputFormat';
import fetchSpeechServicesAuthorizationToken from '../../fetchSpeechServicesAuthorizationToken';
import setPonyfill from '../actions/setPonyfill';

function* setPonyfillSaga() {
  const {
    enableTelemetry,
    onDemandAuthorizationToken,
    ponyfillType,
    region,
    speechRecognitionEndpointId,
    speechRecognitionReferenceGrammars: referenceGrammars,
    speechRecognitionTextNormalization: textNormalization,
    speechServicesAuthorizationToken,
    speechServicesSubscriptionKey,
    speechSynthesisDeploymentId,
    speechSynthesisOutputFormat
  } = yield select();

  if (ponyfillType === 'browser') {
    yield put(
      setPonyfill({
        SpeechGrammarList: window.SpeechGrammarList || window.webkitSpeechGrammarList,
        SpeechRecognition: window.SpeechRecognition || window.webkitSpeechRecognition,
        speechSynthesis: window.speechSynthesis,
        SpeechSynthesisUtterance: window.SpeechSynthesisUtterance
      })
    );
  } else {
    if (!speechServicesAuthorizationToken && !speechServicesSubscriptionKey) {
      return;
    }

    const options = {
      enableTelemetry,
      referenceGrammars,
      region,
      speechRecognitionEndpointId,
      speechSynthesisDeploymentId,
      speechSynthesisOutputFormat,
      textNormalization
    };

    const createPonyfill =
      ponyfillType === 'speechservices:bundle'
        ? window.WebSpeechCognitiveServices.create
        : createSpeechServicesPonyfill;

    const ponyfill = createPonyfill(
      speechServicesAuthorizationToken
        ? {
            ...options,
            credentials: {
              authorizationToken: speechServicesAuthorizationToken,
              region
            }
          }
        : {
            ...options,
            credentials: onDemandAuthorizationToken
              ? async () => {
                  /* eslint-disable-next-line no-console */
                  console.log('On-demand fetching Speech Services authorization token');

                  try {
                    return {
                      authorizationToken: await fetchSpeechServicesAuthorizationToken({
                        region,
                        subscriptionKey: speechServicesSubscriptionKey
                      }),
                      region
                    };
                  } catch (err) {
                    console.error('Failed to fetch Speech Services authorization token', err);
                  }
                }
              : {
                  region,
                  subscriptionKey: speechServicesSubscriptionKey
                }
          }
    );

    yield put(setPonyfill(ponyfill));
  }
}

export default function* setPonyfillRootSaga() {
  yield* setPonyfillSaga();

  yield takeLatest(
    ({ type }) =>
      type === SET_ENABLE_TELEMETRY ||
      type === SET_PONYFILL_TYPE ||
      type === SET_REGION ||
      type === SET_SPEECH_RECOGNITION_REFERENCE_GRAMMARS ||
      type === SET_SPEECH_RECOGNITION_ENDPOINT_ID ||
      type === SET_SPEECH_RECOGNITION_TEXT_NORMALIZATION ||
      type === SET_SPEECH_SERVICES_AUTHORIZATION_TOKEN ||
      type === SET_SPEECH_SERVICES_SUBSCRIPTION_KEY ||
      type === SET_SPEECH_SYNTHESIS_DEPLOYMENT_ID ||
      type === SET_SPEECH_SYNTHESIS_OUTPUT_FORMAT ||
      type === SET_ON_DEMAND_AUTHORIZATION_TOKEN,
    setPonyfillSaga
  );
}
