import { type InferOutput, boolean, optional } from 'valibot';

const looseEventsSchema = optional(boolean(), false);

export type LooseEvents = InferOutput<typeof looseEventsSchema>;

export default looseEventsSchema;
