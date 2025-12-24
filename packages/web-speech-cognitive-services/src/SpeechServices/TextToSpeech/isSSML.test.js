/// <reference types="jest" />

import isSSML from './isSSML';

test('check SSML string by <speak> tag', () => {
  const actual = isSSML('<speak version="1.0">');

  expect(actual).toBeTruthy();
});

test('check SSML string by XML prolog', () => {
  const actual = isSSML('<?xml version="1.0"?>');

  expect(actual).toBeTruthy();
});

test('check SSML string by simple text', () => {
  const actual = isSSML('Hello, World!');

  expect(actual).toBeFalsy();
});
