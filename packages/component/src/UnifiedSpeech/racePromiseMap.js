export default function (map) {
  const values = Object.keys(map).reduce((array, key) => [
    ...array,
    new Promise((resolve, reject) => {
      return map[key].then(
        result => resolve({ [key]: result }),
        reject
      );
    })
  ], []);

  return Promise.race(values);
}
