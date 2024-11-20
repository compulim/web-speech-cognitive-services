import SpeechRecognitionResultList from './SpeechRecognitionResultList';

export type SpeechRecognitionEventInit = {
  data?: undefined | unknown;
  resultIndex?: number | undefined;
  results?: SpeechRecognitionResultList | undefined;
};

export default class SpeechRecognitionEvent<
  T extends
    | 'audioend'
    | 'audiostart'
    | 'cognitiveservices'
    | 'end'
    | 'result'
    | 'soundend'
    | 'soundstart'
    | 'speechend'
    | 'speechstart'
    | 'start'
> extends Event {
  constructor(type: 'cognitiveservices', init: SpeechRecognitionEventInit & { data: { type: string } });
  constructor(type: 'audioend');
  constructor(type: 'audiostart');
  constructor(type: 'end');
  constructor(type: 'result', init: SpeechRecognitionEventInit);
  constructor(type: 'soundend');
  constructor(type: 'soundstart');
  constructor(type: 'speechend');
  constructor(type: 'speechstart');
  constructor(type: 'start');

  constructor(type: T, { data, resultIndex, results }: SpeechRecognitionEventInit = {}) {
    super(type);

    this.#data = data;
    this.#resultIndex = resultIndex;
    this.#results = results || new SpeechRecognitionResultList([]);
  }

  #data: undefined | unknown;
  // TODO: "resultIndex" should be set.
  #resultIndex: number | undefined;
  #results: SpeechRecognitionResultList;

  get data(): unknown {
    return this.#data;
  }

  get resultIndex(): number | undefined {
    return this.#resultIndex;
  }

  get results(): SpeechRecognitionResultList {
    return this.#results;
  }
}
