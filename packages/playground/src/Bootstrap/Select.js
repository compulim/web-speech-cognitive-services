import React from 'react';

export default ({
  disabled,
  onChange,
  value,
  values
}) =>
  <select
    className="custom-select"
    disabled={ disabled }
    onChange={ ({ target: { value } }) => onChange(value) }
    value={ value }
  >
    {
      Object.keys(values).map(key =>
        <option
          key={ key }
          value={ key }
        >{ values[key] }</option>
      )
    }
  </select>
