import { beforeEach, describe, mock, test, type Mock } from 'node:test';
import { expect } from 'expect';
import cognitiveServicesAsyncToPromise from './cognitiveServicesAsyncToPromise.ts';

let fn: Mock<
  (x: number, y: number, z: number, resolve: (returnValue: string) => void, reject: (error: unknown) => void) => void
>;
let promiseFn: (this: string | undefined | void, arg0: number, arg1: number, arg2: number) => Promise<string>;

beforeEach(() => {
  fn = mock.fn();
  promiseFn = cognitiveServicesAsyncToPromise(fn);
});

describe('when called and resolved', () => {
  let resultPromise: Promise<string>;

  beforeEach(() => {
    fn.mock.mockImplementationOnce((x, y, z, resolve) => resolve(`${x + y + z}`));

    resultPromise = promiseFn(1, 2, 3);
  });

  test('should return result', () => expect(resultPromise).resolves.toBe('6'));
});

describe('when called and rejected', () => {
  let resultPromise: Promise<string>;

  beforeEach(() => {
    fn.mock.mockImplementationOnce((_x, _y, _z, _resolve, reject) => reject(new Error('artificial')));

    resultPromise = promiseFn(1, 2, 3);
  });

  test('should reject with error', () => expect(resultPromise).rejects.toThrow('artificial'));
});

describe('when called with context', () => {
  let resultPromise: Promise<string>;

  beforeEach(() => {
    fn = mock.fn();

    promiseFn = cognitiveServicesAsyncToPromise(
      mock.fn(function (this: string | undefined | void, x, y, z, resolve) {
        resolve(`${x + y + z} ${this}`);
      }),
      'Hello!'
    );

    resultPromise = promiseFn(1, 2, 3);
  });

  test('should return result', () => expect(resultPromise).resolves.toBe('6 Hello!'));
});
