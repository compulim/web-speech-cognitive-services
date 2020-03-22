import React from 'react';

const Option = ({ disabled, text, value }) => (
  <option disabled={disabled} value={value}>
    {text}
  </option>
);

export default ({ children, disabled, onChange, value }) => (
  <select
    className="custom-select"
    disabled={disabled}
    onChange={({ target: { value } }) => onChange && onChange(value)}
    value={value}
  >
    {children}
  </select>
);

export { Option };
