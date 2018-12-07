import { connect } from 'react-redux';
import classNames from 'classnames';
import React from 'react';

import MonitoringComponent from './MonitoringComponent';

const MonitoredSpeakingProperty = ({
  getValue
}) =>
  <MonitoringComponent
    getValue={ getValue }
    interval={ 300 }
  >
    { result =>
      <span>
        Speaking&nbsp;
        <span
          className={ classNames(
            'badge',
            {
              'badge-success': result,
              'badge-secondary': !result
            }
          )
        }>
          { result ? 'true' : 'false' }
        </span>
      </span>
    }
  </MonitoringComponent>

export default connect(({
  ponyfill: { speechSynthesis }
}) => ({
  speechSynthesis
}), {}, ({ speechSynthesis }) => ({
  getValue: () => speechSynthesis && speechSynthesis.speaking
}))(MonitoredSpeakingProperty)
