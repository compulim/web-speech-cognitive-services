// The MIT License (MIT)
//
// Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// This piece of code is adopted from https://github.com/sindresorhus/p-defer

// The reason why we need to fork it is because:
// - The original package published to NPM is not ES5-compliant
//    - Due to the use of arrow functions
// - create-react-app@1 does not play nice with packages that are not ES5-compliant
//    - create-react-app@2 do play nice, but it was so new that most of the people are still on @1

// Criteria to remove this package:
// - When create-react-app@2 become mainstream

export default function createDeferred() {
  const ret = {};

  ret.promise = new Promise(function (resolve, reject) {
    ret.resolve = resolve;
    ret.reject = reject;
  });

  return ret;
}
