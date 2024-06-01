import { useSelector } from 'react-redux';
import classNames from 'classnames';
import React, { useCallback } from 'react';

import MonitoringComponent from './MonitoringComponent';

const MonitoredSpeakingProperty = () => {
  const speechSynthesis = useSelector(({ ponyfill: { speechSynthesis } }) => speechSynthesis);
  const getValue = useCallback(() => speechSynthesis && speechSynthesis.speaking, [speechSynthesis]);

  return (
    <MonitoringComponent getValue={getValue} interval={300}>
      {result => (
        <span>
          Speaking&nbsp;
          <span
            className={classNames('badge', {
              'badge-success': result,
              'badge-secondary': !result
            })}
          >
            {result ? 'true' : 'false'}
          </span>
        </span>
      )}
    </MonitoringComponent>
  );
};

export default MonitoredSpeakingProperty;
