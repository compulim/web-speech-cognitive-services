/* eslint-disable @typescript-eslint/no-explicit-any */
export default function cognitiveServicesAsyncToPromise<
  R,
  T extends (resolve: (returnValue: R) => void, reject: (error: unknown) => void) => void = (
    resolve: (returnValue: R) => void,
    reject: (error: unknown) => void
  ) => void
>(fn: T): () => Promise<R>;

export default function cognitiveServicesAsyncToPromise<
  R,
  P0 = any,
  T extends (arg0: P0, resolve: (returnValue: R) => void, reject: (error: unknown) => void) => void = (
    arg0: P0,
    resolve: (returnValue: R) => void,
    reject: (error: unknown) => void
  ) => void
>(fn: T): (arg0: P0) => Promise<R>;

export default function cognitiveServicesAsyncToPromise<
  R,
  P0 = any,
  P1 = any,
  T extends (arg0: P0, arg1: P1, resolve: (returnValue: R) => void, reject: (error: unknown) => void) => void = (
    arg0: P0,
    arg1: P1,
    resolve: (returnValue: R) => void,
    reject: (error: unknown) => void
  ) => void
>(fn: T): (arg0: P0, arg1: P1) => Promise<R>;

export default function cognitiveServicesAsyncToPromise<
  R,
  P0 = any,
  P1 = any,
  P2 = any,
  T extends (
    arg0: P0,
    arg1: P1,
    arg2: P2,
    resolve: (returnValue: R) => void,
    reject: (error: unknown) => void
  ) => void = (
    arg0: P0,
    arg1: P1,
    arg2: P2,
    resolve: (returnValue: R) => void,
    reject: (error: unknown) => void
  ) => void
>(fn: T): (arg0: P0, arg1: P1, arg2: P2) => Promise<R>;

export default function cognitiveServicesAsyncToPromise<
  R,
  P0 = any,
  P1 = any,
  P2 = any,
  P3 = any,
  T extends (
    arg0: P0,
    arg1: P1,
    arg2: P2,
    arg3: P3,
    resolve: (returnValue: R) => void,
    reject: (error: unknown) => void
  ) => void = (
    arg0: P0,
    arg1: P1,
    arg2: P2,
    arg3: P3,
    resolve: (returnValue: R) => void,
    reject: (error: unknown) => void
  ) => void
>(fn: T): (arg0: P0, arg1: P1, arg2: P2, arg3: P3) => Promise<R>;

export default function cognitiveServicesAsyncToPromise<
  R,
  T extends (...args: any[]) => void = (...args: any[]) => void
>(fn: T): (...args: Parameters<T>) => Promise<R> {
  return (...args: Parameters<T>) =>
    // eslint-disable-next-line prefer-spread
    new Promise<R>((resolve, reject) => fn.apply(undefined, [...args, resolve, reject] as unknown as Parameters<T>));
}
