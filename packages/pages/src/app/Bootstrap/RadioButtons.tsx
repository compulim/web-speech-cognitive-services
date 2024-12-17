import classNames from 'classnames';
import React, { type FormEvent, memo } from 'react';

type Props = {
  disabledValues: readonly string[];
  name: string;
  onChange: (value: string, event: FormEvent<HTMLInputElement>) => void;
  value: string;
  values: Record<string, string>;
};

const RadioButtons = ({ disabledValues = [], name, onChange, value, values }: Props) =>
  Object.keys(values).map(key => (
    <div className={classNames('form-check', { disabled: disabledValues.includes(key) })} key={key}>
      <div className="custom-control custom-radio">
        <input
          checked={key === value}
          className="custom-control-input form-check-input"
          disabled={disabledValues.includes(key)}
          id={[name, key].join('.')}
          onChange={onChange.bind(null, key)}
          name={name}
          type="radio"
        />
        <label className="custom-control-label form-check-label" htmlFor={[name, key].join('.')}>
          {values[key]}
        </label>
      </div>
    </div>
  ));

RadioButtons.displayName = 'RadioButtons';

export default memo(RadioButtons);
