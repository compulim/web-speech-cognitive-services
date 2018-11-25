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
        ITN: 'no',
        Lexical: 'no',
        MaskedITN: 'no'
      }, {
        Confidence: .1,
        Display: 'Yes.',
        ITN: 'yes',
        Lexical: 'yes',
        MaskedITN: 'yes'
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
        ITN: 'no',
        Lexical: 'no',
        MaskedITN: 'no'
      }]
    },
    reason: 3
  });

  expect(resultList[0][0]).toEqual({ confidence: .25, transcript: 'No.' });
  expect(resultList[0]).toHaveProperty('isFinal', true);
});
