const ADD_SPEECH_RECOGNITION_EVENT = 'ADD_SPEECH_RECOGNITION_EVENT';

export type AddSpeechRecognitionEventAction = Readonly<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: Readonly<{ event: any }>;
  type: typeof ADD_SPEECH_RECOGNITION_EVENT;
}>;

function serializeEvent<K extends string>(
  from: Record<string, unknown> & { type: string },
  ...keys: K[]
): Readonly<Pick<typeof from, K> & { type: string }> {
  const to: Partial<Pick<typeof from, K>> = { type: from.type } as Partial<Pick<typeof from, K>>;

  keys.forEach(key => {
    to[key] = from[key];
  });

  return Object.freeze(to as Pick<typeof from, K> & { type: string });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function addSpeechRecognitionEvent(event: any): AddSpeechRecognitionEventAction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let serializedEvent: any;

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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      serializedEvent.results = ([] as any[]).reduce.call(
        event.results,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (serializedResults: any, result, index) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          serializedResults[index] = ([] as any[]).reduce.call(
            result,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (serializedResult: any, { confidence, transcript }, index) => {
              serializedResult[index] = { confidence, transcript };

              return serializedResult;
            },
            {
              isFinal: result.isFinal,
              length: result.length
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
          );

          return serializedResults;
        },
        {
          length: event.results.length
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ([] as any[]).forEach.call(event.results, (result, index) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const serializedResult: any = (serializedEvent.results[index] = {
          isFinal: result.isFinal,
          length: result.length
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ([] as any[]).forEach.call(result, (alt, index) => {
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

  return Object.freeze({
    payload: Object.freeze({ event: serializedEvent }),
    type: ADD_SPEECH_RECOGNITION_EVENT
  });
}

export { ADD_SPEECH_RECOGNITION_EVENT };
