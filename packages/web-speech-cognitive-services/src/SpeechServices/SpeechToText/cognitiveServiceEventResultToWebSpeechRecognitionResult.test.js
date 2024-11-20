/**
 * @jest-environment jsdom
 */

import cognitiveServiceEventResultToWebSpeechRecognitionResult from './cognitiveServiceEventResultToWebSpeechRecognitionResult';

test('Multiple results with RecognitionStatus === "Success"', () => {
  const resultList = cognitiveServiceEventResultToWebSpeechRecognitionResult({
    json: {
      NBest: [
        {
          Confidence: 0.25,
          Display: 'No.',
          ITN: 'no (ITN)',
          Lexical: 'no (Lexical)',
          MaskedITN: 'no (MaskedITN)'
        },
        {
          Confidence: 0.1,
          Display: 'Yes.',
          ITN: 'yes (ITN)',
          Lexical: 'yes (Lexical)',
          MaskedITN: 'yes (MaskedITN)'
        }
      ],
      RecognitionStatus: 'Success'
    },
    reason: 3
  });

  expect(resultList[0]).toEqual(expect.objectContaining({ confidence: 0.25, transcript: 'No.' }));
  expect(resultList[1]).toEqual(expect.objectContaining({ confidence: 0.1, transcript: 'Yes.' }));
  expect(resultList).toHaveProperty('isFinal', true);
});

test('Single interim results', () => {
  const resultList = cognitiveServiceEventResultToWebSpeechRecognitionResult({
    reason: 2,
    text: 'No.'
  });

  expect(resultList[0]).toEqual(expect.objectContaining({ confidence: 0.5, transcript: 'No.' }));
  expect(resultList).toHaveProperty('isFinal', false);
});

test('Single final results', () => {
  const resultList = cognitiveServiceEventResultToWebSpeechRecognitionResult({
    json: {
      NBest: [
        {
          Confidence: 0.25,
          Display: 'No.',
          ITN: 'no (ITN)',
          Lexical: 'no (Lexical)',
          MaskedITN: 'no (MaskedITN)'
        }
      ]
    },
    reason: 3
  });

  expect(resultList[0]).toEqual(expect.objectContaining({ confidence: 0.25, transcript: 'No.' }));
  expect(resultList).toHaveProperty('isFinal', true);
});

test('Single final results with ITN', () => {
  const resultList = cognitiveServiceEventResultToWebSpeechRecognitionResult(
    {
      json: {
        NBest: [
          {
            Confidence: 0.25,
            Display: 'No.',
            ITN: 'no (ITN)',
            Lexical: 'no (Lexical)',
            MaskedITN: 'no (MaskedITN)'
          }
        ]
      },
      reason: 3
    },
    {
      textNormalization: 'itn'
    }
  );

  expect(resultList[0]).toEqual(expect.objectContaining({ confidence: 0.25, transcript: 'no (ITN)' }));
  expect(resultList).toHaveProperty('isFinal', true);
});

test('Single final results with lexical', () => {
  const resultList = cognitiveServiceEventResultToWebSpeechRecognitionResult(
    {
      json: {
        NBest: [
          {
            Confidence: 0.25,
            Display: 'No.',
            ITN: 'no (ITN)',
            Lexical: 'no (Lexical)',
            MaskedITN: 'no (MaskedITN)'
          }
        ]
      },
      reason: 3
    },
    {
      textNormalization: 'lexical'
    }
  );

  expect(resultList[0]).toEqual(expect.objectContaining({ confidence: 0.25, transcript: 'no (Lexical)' }));
  expect(resultList).toHaveProperty('isFinal', true);
});

test('Single final results with masked ITN', () => {
  const resultList = cognitiveServiceEventResultToWebSpeechRecognitionResult(
    {
      json: {
        NBest: [
          {
            Confidence: 0.25,
            Display: 'No.',
            ITN: 'no (ITN)',
            Lexical: 'no (Lexical)',
            MaskedITN: 'no (MaskedITN)'
          }
        ]
      },
      reason: 3
    },
    {
      textNormalization: 'maskeditn'
    }
  );

  expect(resultList[0]).toEqual(expect.objectContaining({ confidence: 0.25, transcript: 'no (MaskedITN)' }));
  expect(resultList).toHaveProperty('isFinal', true);
});

test('Result is iterable', () => {
  const resultList = cognitiveServiceEventResultToWebSpeechRecognitionResult(
    {
      json: {
        NBest: [
          {
            Confidence: 0.25,
            Display: 'No.',
            ITN: 'no (ITN)',
            Lexical: 'no (Lexical)',
            MaskedITN: 'no (MaskedITN)'
          }
        ]
      },
      reason: 3
    },
    {}
  );

  const [firstAlternative] = resultList;
  const { isFinal } = resultList;

  expect(firstAlternative).toEqual(expect.objectContaining({ confidence: 0.25, transcript: 'No.' }));
  expect(isFinal).toBe(true);
});
