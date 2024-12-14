import { type InferOutput, intersect, object, optional, pipe, readonly, string, undefined_, union } from 'valibot';

const credentialsSchema = pipe(
  intersect([
    union(
      [
        object({
          authorizationToken: string(),
          subscriptionKey: optional(undefined_('"subscriptionKey" must be unset when "authorizationToken" is set.'))
        }),
        object({
          authorizationToken: optional(undefined_('"authorizationToken" must be unset when "subscriptionKey" is set.')),
          subscriptionKey: string()
        })
      ],
      'The object must either have either "authorizationToken" or "subscriptionKey" set, but not both.'
    ),
    union(
      [
        object({
          customVoiceHostname: optional(undefined_('"customVoiceHostname" must be unest when "region" is set.')),
          region: string(),
          speechRecognitionHostname: optional(
            undefined_('"speechRecognitionHostname" must be unest when "region" is set.')
          ),
          speechSynthesisHostname: optional(undefined_('"speechSynthesisHostname" must be unest when "region" is set.'))
        }),
        object({
          customVoiceHostname: optional(union([string(), undefined_()])),
          region: optional(undefined_('"region" must be unset when "*Hostname" is set.')),
          speechRecognitionHostname: string(),
          speechSynthesisHostname: string()
        })
      ],
      'The object must either have either "region" or "*Hostname" set, but not both.'
    )
  ]),
  readonly()
);

export default credentialsSchema;

export type Credentials = InferOutput<typeof credentialsSchema>;
