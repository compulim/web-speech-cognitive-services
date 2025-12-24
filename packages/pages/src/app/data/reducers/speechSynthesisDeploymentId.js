import { SET_SPEECH_SYNTHESIS_DEPLOYMENT_ID } from '../actions/setSpeechSynthesisDeploymentId.ts';

export default function speechSynthesisDeploymentId(state = '', { payload, type }) {
  if (type === SET_SPEECH_SYNTHESIS_DEPLOYMENT_ID) {
    state = payload.deploymentId;
  }

  return state;
}
