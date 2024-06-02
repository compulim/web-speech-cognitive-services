export default function permutate(permutations) {
  return permutations.reduce(
    (table, permutation) =>
      permutation.length
        ? permutation.reduce(
            (nextTable, variation) => [
              ...nextTable,
              ...(table.length ? table : [[]]).map(existing => [...existing, variation])
            ],
            []
          )
        : table,
    []
  );
}
