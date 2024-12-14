import { boolean, optional } from 'valibot';

const looseEventsSchema = optional(boolean(), false);

export default looseEventsSchema;
