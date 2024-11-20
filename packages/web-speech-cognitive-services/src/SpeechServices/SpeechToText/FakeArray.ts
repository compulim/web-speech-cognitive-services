interface FakeArrayInterface<T> {
  [index: number]: T | undefined;
  get length(): number;
}

export default class FakeArray<T> implements FakeArrayInterface<T> {
  constructor(array: readonly T[]) {
    if (!array) {
      throw new Error('array must be set.');
    }

    this.#array = array;

    for (const key in array) {
      Object.defineProperty(this, key, {
        enumerable: true,
        get() {
          return array[key];
        }
      });
    }
  }

  #array: readonly T[];
  [index: number]: T | undefined;
  [Symbol.iterator]() {
    return this.#array[Symbol.iterator]();
  }

  get length(): number {
    return this.#array.length;
  }
}
