import { optional, string } from 'valibot';

const speechRecognitionEndpointIdSchema = optional(string());

export default speechRecognitionEndpointIdSchema;
