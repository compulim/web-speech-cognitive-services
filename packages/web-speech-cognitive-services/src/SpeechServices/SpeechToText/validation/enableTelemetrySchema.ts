import { boolean, optional } from 'valibot';

const enableTelemetrySchema = optional(boolean());

export default enableTelemetrySchema;
