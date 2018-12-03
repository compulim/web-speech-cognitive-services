import React from 'react';
import classNames from 'classnames';

export default ({
  disabledValues = [],
  onChange,
  value,
  values
}) =>
  <div className="btn-group btn-group-toggle" data-toggle="buttons">
    {
      Object.keys(values).map(key =>
        <label
          className={ classNames('btn btn-primary', { active: key === value, disabled: disabledValues.includes(key) }) }
          key={ key }
        >
          <input
            autoComplete="false"
            checked={ key === value }
            onChange={ onChange.bind(null, key) }
            type="checkbox"
          /> { values[key] }
        </label>
      )
    }
  </div>
