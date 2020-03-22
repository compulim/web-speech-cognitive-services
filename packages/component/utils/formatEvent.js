export default function formatEvent(event) {
  const { type } = event;

  switch (type) {
    case 'audioend':
    case 'audiostart':
    case 'end':
    case 'soundstart':
    case 'soundend':
    case 'speechstart':
    case 'speechend':
    case 'start':
      return type;

    case 'error':
      return [type, { error: event.error, message: event.message }];

    case 'nomatch':
    case 'result':
      return [type, { resultIndex: event.resultIndex, results: formatResultList(event.results) }];

    default:
      return;
  }
}

function formatResultList(resultList) {
  return [].map.call(resultList, result =>
    [].reduce.call(
      result,
      (result, { confidence, transcript }, index) => {
        result[index] = { confidence: Math.round(confidence * 100) / 100, transcript };

        return result;
      },
      { isFinal: result.isFinal, length: result.length }
    )
  );
}
