import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import React, { useCallback } from 'react';

import getPonyfillCapabilities from '../getPonyfillCapabilities';
import Select, { Option } from '../Bootstrap/Select';
import setEnableTelemetry from '../data/actions/setEnableTelemetry';
import setPonyfillType from '../data/actions/setPonyfillType';

const PonyfillSelector = () => {
  const { browserSupportedSpeechRecognition, ponyfillType, enableTelemetry } = useSelector(({
    browserSupportedSpeechRecognition, ponyfillType, enableTelemetry
  }) => ({
    browserSupportedSpeechRecognition, ponyfillType, enableTelemetry
  }));

  const dispatch = useDispatch();
  const dispatchSetEnableTelemetry = useCallback(() => dispatch(setEnableTelemetry(!enableTelemetry)), [dispatch, enableTelemetry]);
  const dispatchSetPonyfillType = useCallback(value => dispatch(setPonyfillType(value)), [dispatch]);
  const ponyfillCapabilities = getPonyfillCapabilities(ponyfillType);

  return (
    <div className="input-group">
      <Select
        onChange={ dispatchSetPonyfillType }
        value={ ponyfillType }
      >
        <Option
          disabled={ !browserSupportedSpeechRecognition }
          text="Browser"
          value="browser"
        />
        <Option
          text="Bing Speech"
          value="bingspeech"
        />
        <Option
          text="Speech Services"
          value="speechservices:npm"
        />
        <Option
          text="Speech Services (via bundle)"
          value="speechservices:bundle"
        />
      </Select>
      <div className="input-group-append">
        <button
          className={ classNames('btn btn-outline-secondary', { active: enableTelemetry }) }
          disabled={ !ponyfillCapabilities.telemetry }
          onClick={ dispatchSetEnableTelemetry }
          type="button"
        >Telemetry</button>
      </div>
    </div>
  );
}

export default PonyfillSelector
