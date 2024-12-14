import { boolean, type InferOutput, optional } from 'valibot';

const enableTelemetrySchema = optional(boolean());

export type EnableTelemetry = InferOutput<typeof enableTelemetrySchema>;

export default enableTelemetrySchema;
