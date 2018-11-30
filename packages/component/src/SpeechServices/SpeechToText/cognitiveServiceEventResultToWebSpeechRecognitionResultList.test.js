/**
 * @jest-environment jsdom
 */

import cognitiveServiceEventResultToWebSpeechRecognitionResultList from './cognitiveServiceEventResultToWebSpeechRecognitionResultList';

test('Multiple results with RecognitionStatus === "Success"', () => {
  const resultList = cognitiveServiceEventResultToWebSpeechRecognitionResultList({
    json: {
      NBest: [{
        Confidence: .25,
        Display: 'No.',
        ITN: 'no (ITN)',
        Lexical: 'no (Lexical)',
        MaskedITN: 'no (MaskedITN)'
      }, {
        Confidence: .1,
        Display: 'Yes.',
        ITN: 'yes (ITN)',
        Lexical: 'yes (Lexical)',
        MaskedITN: 'yes (MaskedITN)'
      }],
      RecognitionStatus: 'Success'
    },
    reason: 3
  });

  expect(resultList[0][0]).toEqual({ confidence: .25, transcript: 'No.' });
  expect(resultList[0][1]).toEqual({ confidence: .1, transcript: 'Yes.' });
  expect(resultList[0]).toHaveProperty('isFinal', true);
});

test('Single interim results', () => {
  const resultList = cognitiveServiceEventResultToWebSpeechRecognitionResultList({
    reason: 2,
    text: 'No.'
  });

  expect(resultList[0][0]).toEqual({ confidence: .5, transcript: 'No.' });
  expect(resultList[0]).not.toHaveProperty('isFinal');
});

test('Single final results', () => {
  const resultList = cognitiveServiceEventResultToWebSpeechRecognitionResultList({
    json: {
      NBest: [{
        Confidence: .25,
        Display: 'No.',
        ITN: 'no (ITN)',
        Lexical: 'no (Lexical)',
        MaskedITN: 'no (MaskedITN)'
      }]
    },
    reason: 3
  });

  expect(resultList[0][0]).toEqual({ confidence: .25, transcript: 'No.' });
  expect(resultList[0]).toHaveProperty('isFinal', true);
});

test('Single final results with ITN', () => {
  const resultList = cognitiveServiceEventResultToWebSpeechRecognitionResultList({
    json: {
      NBest: [{
        Confidence: .25,
        Display: 'No.',
        ITN: 'no (ITN)',
        Lexical: 'no (Lexical)',
        MaskedITN: 'no (MaskedITN)'
      }]
    },
    reason: 3
  }, 'itn');

  expect(resultList[0][0]).toEqual({ confidence: .25, transcript: 'no (ITN)' });
  expect(resultList[0]).toHaveProperty('isFinal', true);
});

test('Single final results with lexical', () => {
  const resultList = cognitiveServiceEventResultToWebSpeechRecognitionResultList({
    json: {
      NBest: [{
        Confidence: .25,
        Display: 'No.',
        ITN: 'no (ITN)',
        Lexical: 'no (Lexical)',
        MaskedITN: 'no (MaskedITN)'
      }]
    },
    reason: 3
  }, 'lexical');

  expect(resultList[0][0]).toEqual({ confidence: .25, transcript: 'no (Lexical)' });
  expect(resultList[0]).toHaveProperty('isFinal', true);
});

test('Single final results with masked ITN', () => {
  const resultList = cognitiveServiceEventResultToWebSpeechRecognitionResultList({
    json: {
      NBest: [{
        Confidence: .25,
        Display: 'No.',
        ITN: 'no (ITN)',
        Lexical: 'no (Lexical)',
        MaskedITN: 'no (MaskedITN)'
      }]
    },
    reason: 3
  }, 'maskeditn');

  expect(resultList[0][0]).toEqual({ confidence: .25, transcript: 'no (MaskedITN)' });
  expect(resultList[0]).toHaveProperty('isFinal', true);
});
