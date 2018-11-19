export default function (result) {
  let resultList = [];

  if (result.reason === 2) {
    resultList = [[{
      confidence: .5,
      transcript: result.text
    }]];
  } else if (result.reason === 3) {
    resultList = [(result.json.NBest || []).map(
      ({
        Confidence: confidence,
        Display: transcript
      }) => ({
        confidence,
        transcript
      })
    )];

    if (result.json.RecognitionStatus === 'Success') {
      resultList.isFinal = true;
    }
  }

  return resultList;
}
