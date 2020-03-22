import React, { useState } from 'react';

import useInterval from '../useInterval';

const MonitoringComponent = ({ children, getValue, interval }) => {
  const [result, setResult] = useState();

  useInterval(
    () => {
      const nextResult = getValue();

      result !== nextResult && setResult(nextResult);
    },
    interval || 300,
    [getValue, result]
  );

  return <React.Fragment key={result}>{typeof children === 'function' ? children(result) : children}</React.Fragment>;
};

export default MonitoringComponent;
