const ADD_SPEECH_RECOGNITION_EVENT = 'ADD_SPEECH_RECOGNITION_EVENT';

function serializeEvent(from, ...keys) {
  const to = { type: from.type };

  keys.forEach(key => {
    to[key] = from[key];
  });

  return to;
}

export default function (event) {
  let serializedEvent;

  switch (event.type) {
    // case 'boundary':
    // case 'end':
    // case 'mark':
    // case 'pause':
    // case 'resume':
    // case 'start':
    //   serializedEvent = copyEvent(
    //     event,
    //     'charIndex',
    //     'elapsedTime',
    //     'name',
    //     'utterance'
    //   );
    //   break;

    case 'error':
      serializedEvent = serializeEvent(event, 'error', 'message');
      break;

    case 'nomatch':
    case 'result':
      serializedEvent = serializeEvent(event, 'emma', 'interpretation', 'resultIndex');
      serializedEvent.results = {
        length: event.results.length
      };

      serializedEvent.results = [].reduce.call(event.results, (serializedResults, result, index) => {
        serializedResults[index] = [].reduce.call(result, (serializedResult, { confidence, transcript }, index) => {
          serializedResult[index] = { confidence, transcript };

          return serializedResult;
        }, {
          isFinal: result.isFinal,
          length: result.length
        });

        return serializedResults;
      }, {
        length: event.results.length
      });

      [].forEach.call(event.results, (result, index) => {
        const serializedResult = serializedEvent.results[index] = {
          isFinal: result.isFinal,
          length: result.length
        };

        [].forEach.call(result, (alt, index) => {
          serializedResult[index] = {
            confidence: alt.confidence,
            transcript: alt.transcript
          };
        });
      });

      break;

    case 'cognitiveservices':
      serializedEvent = { data: event.data, type: 'cognitiveservices' };
      break;

    default:
      serializedEvent = serializeEvent(event);
      break;
  }

  return {
    type: ADD_SPEECH_RECOGNITION_EVENT,
    payload: { event: serializedEvent }
  };
}

export { ADD_SPEECH_RECOGNITION_EVENT }
