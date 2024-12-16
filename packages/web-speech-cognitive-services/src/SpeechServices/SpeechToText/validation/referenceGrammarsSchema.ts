import { array, type InferOutput, optional, pipe, string, transform } from 'valibot';

const referenceGrammarsSchema = pipe(
  optional(array(string()), []),
  // any(),
  // array(string()),
  // transform<string[], readonly string[]>(value => (Object.isFrozen(value) ? value : Object.freeze([...value])))
  transform<string[], readonly string[]>(value => (Object.isFrozen(value) ? value : Object.freeze([...value])))
);

export type ReferenceGrammars = InferOutput<typeof referenceGrammarsSchema>;

export default referenceGrammarsSchema;
