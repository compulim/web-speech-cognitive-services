export default function convertCognitiveServicesEventResultToSpeechRecognitionResultList(result, isFinal) {
  const resultList = [result.json.NBest.map(
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

  return resultList;
}
