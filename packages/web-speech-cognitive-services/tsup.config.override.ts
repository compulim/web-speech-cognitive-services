import { type Options } from 'tsup';

export default function override(options: Options): Options {
  return {
    ...options
  };
}
