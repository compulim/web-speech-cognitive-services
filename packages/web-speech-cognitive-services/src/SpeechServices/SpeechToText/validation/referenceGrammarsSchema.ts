import { array, optional, pipe, string, transform } from 'valibot';

const referenceGrammarsSchema = pipe(
  optional(array(string()), []),
  // any(),
  // array(string()),
  // transform<string[], readonly string[]>(value => (Object.isFrozen(value) ? value : Object.freeze([...value])))
  transform<string[], readonly string[]>(value => (Object.isFrozen(value) ? value : Object.freeze([...value])))
);

export default referenceGrammarsSchema;
