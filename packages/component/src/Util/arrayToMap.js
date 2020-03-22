export default function(array, extras) {
  const map = {
    ...[].reduce.call(
      array,
      (map, value, index) => {
        map[index] = value;

        return map;
      },
      {}
    ),
    ...extras,
    length: array.length,
    [Symbol.iterator]: () => [].slice.call(map)[Symbol.iterator]()
  };

  return map;
}
