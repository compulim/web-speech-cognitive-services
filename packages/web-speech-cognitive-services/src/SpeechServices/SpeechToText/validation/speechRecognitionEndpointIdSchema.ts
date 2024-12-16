import { type InferOutput, optional, string } from 'valibot';

const speechRecognitionEndpointIdSchema = optional(string());

export type SpeechRecognitionEndpointId = InferOutput<typeof speechRecognitionEndpointIdSchema>;

export default speechRecognitionEndpointIdSchema;
