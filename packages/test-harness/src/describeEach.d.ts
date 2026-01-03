declare interface DescribeEach<T extends any[]> {
  (rows: readonly T[]): (message: string, fn: (...args: T) => void) => void;
  only(rows: readonly T[]): (message: string, fn: (...args: T) => void) => void;
}

exports = { describeEach: DescribeEach<T> };

// declare function describeEach<T>(
//   rows: readonly (readonly [T])[]
// ): (message: string, fn: (arg0: T) => void) => void;

// declare function describeEach<T0, T1>(
//   rows: readonly (readonly [T0, T1])[]
// ): (message: string, fn: (arg0: T0, arg1: T1) => void) => void;

// declare function describeEach<T0, T1, T2>(
//   rows: readonly (readonly [T0, T1, T2])[]
// ): (message: string, fn: (arg0: T0, arg1: T1, arg3: T2) => void) => void;

// declare function describeEach<T0, T1, T2, T3>(
//   rows: readonly (readonly [T0, T1, T2, T3])[]
// ): (message: string, fn: (arg0: T0, arg1: T1, arg2: T2, arg3: T3) => void) => void;

// declare function describeEach<T0, T1, T2, T3, T4>(
//   rows: readonly (readonly [T0, T1, T2, T3, T4])[]
// ): (message: string, fn: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4) => void) => void;

// declare function describeEach<T0, T1, T2, T3, T4, T5>(
//   rows: readonly (readonly [T0, T1, T2, T3, T4, T5])[]
// ): (message: string, fn: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => void) => void;

// declare function describeEach<T0, T1, T2, T3, T4, T5, T6>(
//   rows: readonly (readonly [T0, T1, T2, T3, T4, T5, T6])[]
// ): (message: string, fn: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => void) => void;

// declare function describeEach<T0, T1, T2, T3, T4, T5, T6, T7>(
//   rows: readonly (readonly [T0, T1, T2, T3, T4, T5, T6, T7])[]
// ): (
//   message: string,
//   fn: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => void
// ) => void;

// declare function describeEach<T0, T1, T2, T3, T4, T5, T6, T7, T8>(
//   rows: readonly (readonly [T0, T1, T2, T3, T4, T5, T6, T7, T8])[]
// ): (
//   message: string,
//   fn: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => void
// ) => void;

// exports = { describeEach };
