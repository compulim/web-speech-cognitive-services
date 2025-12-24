/// <reference types="jest" />

import cognitiveServicesAsyncToPromise from './cognitiveServicesAsyncToPromise';

let fn: jest.Mock<
  void,
  [number, number, number, (returnValue: string) => void, (error: unknown) => void],
  string | undefined | void
>;
let promiseFn: (this: string | undefined | void, arg0: number, arg1: number, arg2: number) => Promise<string>;

beforeEach(() => {
  fn = jest.fn();
  promiseFn = cognitiveServicesAsyncToPromise(fn);
});

describe('when called and resolved', () => {
  let resultPromise: Promise<string>;

  beforeEach(() => {
    fn.mockImplementationOnce((x, y, z, resolve) => resolve(`${x + y + z}`));

    resultPromise = promiseFn(1, 2, 3);
  });

  test('should return result', () => expect(resultPromise).resolves.toBe('6'));
});

describe('when called and rejected', () => {
  let resultPromise: Promise<string>;

  beforeEach(() => {
    fn.mockImplementationOnce((_x, _y, _z, _resolve, reject) => reject(new Error('artificial')));

    resultPromise = promiseFn(1, 2, 3);
  });

  test('should reject with error', () => expect(resultPromise).rejects.toThrow('artificial'));
});

describe('when called with context', () => {
  let resultPromise: Promise<string>;

  beforeEach(() => {
    promiseFn = cognitiveServicesAsyncToPromise(
      jest.fn(function (x, y, z, resolve) {
        resolve(`${x + y + z} ${this}`);
      }),
      'Hello!'
    );
    resultPromise = promiseFn(1, 2, 3);
  });

  test('should return result', () => expect(resultPromise).resolves.toBe('6 Hello!'));
});
