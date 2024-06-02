import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback } from 'react';

import setSpeechSynthesisText from '../data/actions/setSpeechSynthesisText';
import setSpeechSynthesisVoiceURI from '../data/actions/setSpeechSynthesisVoiceURI';

const SpeechSynthesisTextBox = () => {
  const { speechSynthesisNativeVoices, speechSynthesisText } = useSelector(
    ({ speechSynthesisNativeVoices, speechSynthesisText }) => ({
      speechSynthesisNativeVoices,
      speechSynthesisText
    })
  );

  const dispatch = useDispatch();
  const dispatchSetSpeechSynthesisText = useCallback(value => dispatch(setSpeechSynthesisText(value)), [dispatch]);

  const dispatchSetSpeechSynthesisVoice = useCallback(
    patterns => {
      patterns.some(pattern => {
        const voice = speechSynthesisNativeVoices.find(({ name }) => ~name.indexOf(pattern));

        voice && dispatch(setSpeechSynthesisVoiceURI(voice.voiceURI));

        return voice;
      });
    },
    [dispatch, speechSynthesisNativeVoices]
  );

  const handleCantoneseClick = useCallback(() => {
    dispatchSetSpeechSynthesisText(
      '一天，悶悶不樂的愛麗絲跟姊姊同坐於河畔。忽見一隻古怪的白兔走過──牠穿戴打扮，手持懷錶，自言自語，行色匆匆。好奇的愛麗絲跟着牠跑，跳進兔子洞裏去。'
    );
    dispatchSetSpeechSynthesisVoice(['TracyRUS']);
  }, [dispatchSetSpeechSynthesisText, dispatchSetSpeechSynthesisVoice]);

  const handleEnglishClick = useCallback(() => {
    dispatchSetSpeechSynthesisText(
      'Pooh is very social. After Christopher Robin, his closest friend is Piglet, and he most often chooses to spend his time with one or both of them.'
    );
    dispatchSetSpeechSynthesisVoice(['JessaNeural', 'Jessa24kRUS', 'JessaRUS']);
  }, [dispatchSetSpeechSynthesisText, dispatchSetSpeechSynthesisVoice]);

  const handleEnglishSSMLClick = useCallback(() => {
    dispatchSetSpeechSynthesisText(
      '<speak version="1.0" xml:lang="en-US"><voice xml:lang="en-US" name="Microsoft Server Speech Text to Speech Voice (en-US, GuyNeural)"><prosody pitch="+20%" rate="+20%" volume="0%">Pooh is very social. After Christopher Robin, his closest friend is Piglet, and he most often chooses to spend his time with one or both of them.</prosody></voice></speak>'
    );
  }, [dispatchSetSpeechSynthesisText]);

  const handleTextChange = useCallback(({ target: { value } }) => dispatchSetSpeechSynthesisText(value), [
    dispatchSetSpeechSynthesisText
  ]);

  return (
    <div className="input-group">
      <div className="input-group-prepend">
        <button
          aria-expanded="false"
          aria-haspopup="true"
          className="btn btn-outline-secondary dropdown-toggle"
          data-toggle="dropdown"
          type="button"
        >
          Preset
        </button>
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={handleEnglishClick} type="button">
            Winnie the Pooh (English)
          </button>
          <button className="dropdown-item" onClick={handleEnglishSSMLClick} type="button">
            Winnie the Pooh (English in SSML)
          </button>
          <button className="dropdown-item" onClick={handleCantoneseClick} type="button">
            Alice Adventures in Wonderland (Cantonese)
          </button>
        </div>
      </div>
      <input
        aria-label="Text to synthesis as speech"
        className="form-control"
        onChange={handleTextChange}
        type="text"
        value={speechSynthesisText}
      />
    </div>
  );
};

export default SpeechSynthesisTextBox;
