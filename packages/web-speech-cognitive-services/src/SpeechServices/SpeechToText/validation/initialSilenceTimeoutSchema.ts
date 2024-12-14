import { maxValue, minValue, number, optional, pipe } from 'valibot';

// 60_000 is an arbitrary value, we can set it to a larger number.
const initialSilenceTimeoutSchema = optional(pipe(number(), minValue(1), maxValue(60_000)));

export default initialSilenceTimeoutSchema;
