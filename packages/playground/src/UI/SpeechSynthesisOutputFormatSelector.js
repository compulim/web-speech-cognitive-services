import { useSelector } from 'react-redux';
import React from 'react';

import setSpeechSynthesisOutputFormat from '../data/actions/setSpeechSynthesisOutputFormat';
import Select, { Option } from '../Bootstrap/Select';
import useDispatchAction from '../useDispatchAction';

const SpeechSynthesisOutputFormatSelector = () => {
  const { ponyfillType, speechSynthesisOutputFormat } = useSelector(({
    ponyfillType, speechSynthesisOutputFormat
  }) => ({
    ponyfillType, speechSynthesisOutputFormat
  }));

  const dispatchSetSpeechSynthesisOutputFormat = useDispatchAction(setSpeechSynthesisOutputFormat);

  return (
    <Select
      disabled={ ponyfillType === 'browser' || ponyfillType === 'bingspeech' }
      onChange={ dispatchSetSpeechSynthesisOutputFormat }
      value={ speechSynthesisOutputFormat }
    >
      <Option text="MP3 160Kbps 24KHz" value="audio-24khz-160kbitrate-mono-mp3" />
      <Option text="MP3 128Kbps 16KHz" value="audio-16khz-128kbitrate-mono-mp3" />
      <Option text="MP3 96Kbps 24KHz" value="audio-24khz-96kbitrate-mono-mp3" />
      <Option text="MP3 64Kbps 16KHz" value="audio-16khz-64kbitrate-mono-mp3" />
      <Option text="MP3 48Kbps 24KHz" value="audio-24khz-48kbitrate-mono-mp3" />
      <Option text="MP3 32Kbps 16KHz" value="audio-16khz-32kbitrate-mono-mp3" />
      <Option text="WAV 24KHz 16-bit PCM" value="riff-24khz-16bit-mono-pcm" />
      <Option text="WAV 16KHz 16-bit PCM" value="riff-16khz-16bit-mono-pcm" />
      <Option text="WAV 8KHz 8-bit a-law" value="riff-8khz-8bit-mono-alaw" />
      <Option text="WAV 8KHz 8-bit &#x03BC;-law" value="riff-8khz-8bit-mono-mulaw" />
    </Select>
  );
}

export default SpeechSynthesisOutputFormatSelector
