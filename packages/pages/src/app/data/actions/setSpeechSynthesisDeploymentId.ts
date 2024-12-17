const SET_SPEECH_SYNTHESIS_DEPLOYMENT_ID = 'SET_SPEECH_SYNTHESIS_DEPLOYMENT_ID' as const;

export type SetSpeechSynthesisDeploymentIdAction = Readonly<{
  payload: Readonly<{ deploymentId: string }>;
  type: typeof SET_SPEECH_SYNTHESIS_DEPLOYMENT_ID;
}>;

export default function setSpeechSynthesisDeploymentId(
  deploymentId: SetSpeechSynthesisDeploymentIdAction['payload']['deploymentId']
): SetSpeechSynthesisDeploymentIdAction {
  return Object.freeze({
    payload: Object.freeze({ deploymentId }),
    type: SET_SPEECH_SYNTHESIS_DEPLOYMENT_ID
  });
}

export { SET_SPEECH_SYNTHESIS_DEPLOYMENT_ID };
