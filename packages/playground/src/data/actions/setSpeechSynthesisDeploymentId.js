const SET_SPEECH_SYNTHESIS_DEPLOYMENT_ID = 'SET_SPEECH_SYNTHESIS_DEPLOYMENT_ID';

export default function (deploymentId) {
  return {
    type: SET_SPEECH_SYNTHESIS_DEPLOYMENT_ID,
    payload: { deploymentId }
  };
}

export { SET_SPEECH_SYNTHESIS_DEPLOYMENT_ID }
