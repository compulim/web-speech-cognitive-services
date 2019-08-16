import { useSelector } from 'react-redux';
import React from 'react';

import setSpeechSynthesisText from '../data/actions/setSpeechSynthesisText';
import useDispatchAction from '../useDispatchAction';

const SpeechSynthesisTextBox = () => {
  const speechSynthesisText = useSelector(({ speechSynthesisText }) => speechSynthesisText);
  const dispatchSetSpeechSynthesisText = useDispatchAction(setSpeechSynthesisText);

  return (
    <div className="input-group">
      <div className="input-group-prepend">
        <button
          aria-expanded="false"
          aria-haspopup="true"
          className="btn btn-outline-secondary dropdown-toggle"
          data-toggle="dropdown"
          type="button"
        >Preset</button>
        <div className="dropdown-menu">
          <button
            className="dropdown-item"
            onClick={ () => dispatchSetSpeechSynthesisText('Pooh is very social. After Christopher Robin, his closest friend is Piglet, and he most often chooses to spend his time with one or both of them.') }
            type="button"
          >Winnie the Pooh (English)</button>
          <button
            className="dropdown-item"
            onClick={ () => dispatchSetSpeechSynthesisText('一天，悶悶不樂的愛麗絲跟姊姊同坐於河畔。忽見一隻古怪的白兔走過──牠穿戴打扮，手持懷錶，自言自語，行色匆匆。好奇的愛麗絲跟着牠跑，跳進兔子洞裏去。') }
            type="button"
          >Alice Adventures in Wonderland (Cantonese)</button>
        </div>
      </div>
      <input
        aria-label="Text to synthesis as speech"
        className="form-control"
        onChange={ ({ target: { value } }) => setSpeechSynthesisText(value) }
        type="text"
        value={ speechSynthesisText }
      />
    </div>
  );
}

export default SpeechSynthesisTextBox
