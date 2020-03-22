import permutate from './permutate';

export default function createTestTable(combos, formatter) {
  const permutations = permutate(combos);

  return formatter ? permutations.map(args => [formatter(...args), ...args]) : permutations;
}
