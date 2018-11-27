import { connect } from 'react-redux';
import memoizeWithDispose from 'memoize-one-with-dispose';
import React from 'react';

import setSpeechSynthesisVoiceURI from '../data/actions/setSpeechSynthesisVoiceURI';
import Select, { Option } from '../Bootstrap/Select';

function serializeVoices(voices) {
  return [].map.call(voices, ({ name, voiceURI }) => ({ name, voiceURI }));
}

class SpeechSynthesisVoiceSelector extends React.Component {
  constructor() {
    super();

    this.refreshVoices = this.refreshVoices.bind(this);

    this.setPonyfill = memoizeWithDispose(
      ({ speechSynthesis } = {}) => {
        speechSynthesis && speechSynthesis.addEventListener('voiceschanged', this.refreshVoices);

        this.refreshVoices();
      },
      undefined,
      (_, { speechSynthesis } = {}) => {
        speechSynthesis && speechSynthesis.removeEventListener('voiceschanged', this.refreshVoices);
      }
    );

    this.state = { voices: [] };
  }

  componentDidMount() {
    this.setPonyfill(this.props.ponyfill);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.ponyfill !== nextProps.ponyfill) {
      this.setPonyfill(nextProps.ponyfill);
    }
  }

  refreshVoices() {
    const { speechSynthesis } = this.props.ponyfill;
    const voices = speechSynthesis ? serializeVoices(speechSynthesis.getVoices()) : [];

    this.setState(() => ({ voices }));
  }

  render() {
    const {
      props: {
        setSpeechSynthesisVoiceURI,
        speechSynthesisVoiceURI
      },
      state: { voices }
    } = this;

    console.log(speechSynthesisVoiceURI);

    return (
      <Select
        onChange={ setSpeechSynthesisVoiceURI }
        value={ speechSynthesisVoiceURI }
      >
        { voices.map(({ name, voiceURI }) =>
          <Option
            key={ voiceURI }
            text={ name }
            value={ voiceURI }
          />
        ) }
      </Select>
    );
  }
}

export default connect(
  ({ speechSynthesisVoiceURI }) => ({ speechSynthesisVoiceURI }),
  { setSpeechSynthesisVoiceURI }
)(SpeechSynthesisVoiceSelector)
