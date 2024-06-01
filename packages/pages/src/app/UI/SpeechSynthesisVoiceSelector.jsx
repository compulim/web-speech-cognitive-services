import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback } from 'react';

import setSpeechSynthesisVoiceURI from '../data/actions/setSpeechSynthesisVoiceURI';
import Select, { Option } from '../Bootstrap/Select';

const SPEAK_TAG_PATTERN = /^\s*<speak[\s>]/u;
const XML_PROLOG_PATTERN = /^\s*<?xml\s/u;

function isSSML(text) {
  return SPEAK_TAG_PATTERN.test(text) || XML_PROLOG_PATTERN.test(text);
}

const SpeechSynthesisVoiceSelector = () => {
  const { speechSynthesisNativeVoices, speechSynthesisText, speechSynthesisVoiceURI } = useSelector(
    ({ speechSynthesisNativeVoices, speechSynthesisText, speechSynthesisVoiceURI }) => ({
      speechSynthesisNativeVoices,
      speechSynthesisText,
      speechSynthesisVoiceURI
    })
  );

  const dispatch = useDispatch();
  const dispatchSetSpeechSynthesisVoiceURI = useCallback(value => dispatch(setSpeechSynthesisVoiceURI(value)), [
    dispatch
  ]);

  return (
    <Select
      disabled={isSSML(speechSynthesisText) || !speechSynthesisNativeVoices.length}
      onChange={dispatchSetSpeechSynthesisVoiceURI}
      value={speechSynthesisVoiceURI || ''}
    >
      {speechSynthesisNativeVoices.map(({ name, voiceURI }) => (
        <Option key={voiceURI} text={name} value={voiceURI} />
      ))}
    </Select>
  );
};

export default SpeechSynthesisVoiceSelector;
