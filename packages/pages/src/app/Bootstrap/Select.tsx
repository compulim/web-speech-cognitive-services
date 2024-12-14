import React, { memo, type ReactNode } from 'react';

type OptionProps = {
  disabled?: boolean | undefined;
  text: string;
  value: string;
};

const Option = ({ disabled, text, value }: OptionProps) => (
  <option disabled={disabled} value={value}>
    {text}
  </option>
);

Option.displayName = 'Option';

const MemoizedOption = memo(Option);

type Props = {
  children?: ReactNode | undefined;
  disabled?: boolean | undefined;
  onChange?: ((value: string) => void) | undefined;
  value: string;
};

const Select = ({ children, disabled, onChange, value }: Props) => (
  <select
    className="custom-select"
    disabled={disabled}
    onChange={({ target: { value } }) => onChange && onChange(value)}
    value={value}
  >
    {children}
  </select>
);

Select.displayName = 'Select';

export default memo(Select);

export { MemoizedOption as Option, type OptionProps, type Props };
