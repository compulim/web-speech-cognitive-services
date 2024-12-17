import classNames from 'classnames';
import React, { FormEvent, memo } from 'react';

type Props = {
  disabledValues: string[];
  onChange: (value: string, event: FormEvent<HTMLInputElement>) => void;
  value: string;
  values: Record<string, string>;
};

const RadioButtonGroup = ({ disabledValues = [], onChange, value, values }: Props) => (
  <div className="btn-group btn-group-toggle" data-toggle="buttons">
    {Object.keys(values).map(key => (
      <label
        className={classNames('btn btn-primary', { active: key === value, disabled: disabledValues.includes(key) })}
        key={key}
      >
        <input autoComplete="false" checked={key === value} onChange={onChange.bind(null, key)} type="checkbox" />{' '}
        {values[key]}
      </label>
    ))}
  </div>
);

RadioButtonGroup.displayName = 'RadioButtonGroup';

export default memo(RadioButtonGroup);
