import testTableForAuthentication from './testTableForAuthentication';

test('4 variations', () => {
  expect(testTableForAuthentication).toHaveProperty('length', 4);
});
