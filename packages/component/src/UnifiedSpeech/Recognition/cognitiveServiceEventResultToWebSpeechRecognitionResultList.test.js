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

  expect([].slice.call(resultList)).toEqual([
    [{
      confidence: .25,
      transcript: 'No.'
    }, {
      confidence: .1,
      transcript: 'Yes.'
    }]
  ]);

  expect(resultList).toHaveProperty('isFinal', true);
});

test('Single interim results', () => {
  const resultList = cognitiveServiceEventResultToWebSpeechRecognitionResultList({
    reason: 2,
    text: 'No.'
  });

  expect([].slice.call(resultList)).toEqual([
    [{
      confidence: .5,
      transcript: 'No.'
    }]
  ]);

  expect(resultList).not.toHaveProperty('isFinal');
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

  expect([].slice.call(resultList)).toEqual([
    [{
      confidence: .25,
      transcript: 'No.'
    }]
  ]);

  expect(resultList).not.toHaveProperty('isFinal');
});
