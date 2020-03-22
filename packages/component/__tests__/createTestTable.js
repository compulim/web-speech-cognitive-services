import createTestTable from '../utils/createTestTable';

describe('createTestTable', () => {
  test('with 3x3x2 combos', () => {
    const actual = createTestTable(
      [
        [1, 2, 3],
        ['a', 'b', 'c'],
        [true, false]
      ],
      (x, y, z) => [x, y, z].join(' ')
    );

    expect(actual).toEqual([
      ['1 a true', 1, 'a', true],
      ['2 a true', 2, 'a', true],
      ['3 a true', 3, 'a', true],
      ['1 b true', 1, 'b', true],
      ['2 b true', 2, 'b', true],
      ['3 b true', 3, 'b', true],
      ['1 c true', 1, 'c', true],
      ['2 c true', 2, 'c', true],
      ['3 c true', 3, 'c', true],
      ['1 a false', 1, 'a', false],
      ['2 a false', 2, 'a', false],
      ['3 a false', 3, 'a', false],
      ['1 b false', 1, 'b', false],
      ['2 b false', 2, 'b', false],
      ['3 b false', 3, 'b', false],
      ['1 c false', 1, 'c', false],
      ['2 c false', 2, 'c', false],
      ['3 c false', 3, 'c', false]
    ]);
  });

  test('with authentication options', () => {
    const combos = [
      [true, false],
      [
        { region: 'westus2' },
        {
          speechRecognitionHostname: 'westus2.stt.speech.microsoft.com',
          speechSynthesisHostname: 'westus2.tts.speech.microsoft.com',
          tokenURL: 'https://westus2.api.cognitive.microsoft.com/sts/v1.0/issueToken'
        }
      ]
    ];

    const actual = createTestTable(combos, (useAuthorizationToken, { region }) =>
      [useAuthorizationToken ? 'authorization token' : 'subscription key', region ? 'region' : 'host'].join(' and ')
    );

    expect(actual).toEqual([
      ['authorization token and region', true, { region: process.env.REGION }],
      ['subscription key and region', false, { region: process.env.REGION }],
      [
        'authorization token and host',
        true,
        {
          speechRecognitionHostname: 'westus2.stt.speech.microsoft.com',
          speechSynthesisHostname: 'westus2.tts.speech.microsoft.com',
          tokenURL: 'https://westus2.api.cognitive.microsoft.com/sts/v1.0/issueToken'
        }
      ],
      [
        'subscription key and host',
        false,
        {
          speechRecognitionHostname: 'westus2.stt.speech.microsoft.com',
          speechSynthesisHostname: 'westus2.tts.speech.microsoft.com',
          tokenURL: 'https://westus2.api.cognitive.microsoft.com/sts/v1.0/issueToken'
        }
      ]
    ]);
  });

  test('with 2x0 combos', () => {
    expect(createTestTable([[1, 2], []])).toEqual([[1], [2]]);
  });

  test('with 0x2 combos', () => {
    expect(createTestTable([[], [1, 2]])).toEqual([[1], [2]]);
  });

  test('with 0x2x0 combos', () => {
    expect(createTestTable([[], [1, 2], []])).toEqual([[1], [2]]);
  });
});
