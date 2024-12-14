import { type InferOutput, enum_, optional } from 'valibot';

const textNormalizationSchema = optional(
  enum_({
    display: 'display',
    itn: 'itn',
    lexical: 'lexical',
    maskeditn: 'maskeditn'
  }),
  'display'
);

export type TextNormalization = InferOutput<typeof textNormalizationSchema>;

export default textNormalizationSchema;
