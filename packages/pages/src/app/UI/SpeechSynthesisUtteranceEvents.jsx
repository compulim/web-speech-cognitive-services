import { useSelector } from 'react-redux';
import React, { useMemo } from 'react';

// eslint-disable-next-line react/prop-types
const SpeechSynthesisUtteranceEvent = ({ utteranceID }) => {
  const speechSynthesisUtterances = useSelector(({ speechSynthesisUtterances }) => speechSynthesisUtterances);
  const events = useMemo(
    () => (speechSynthesisUtterances.find(({ id }) => id === utteranceID) || {}).events || [],
    [speechSynthesisUtterances, utteranceID]
  );

  return (
    <div>
      {events.map((event, index) => (
        <React.Fragment key={index}>
          {event.type === 'start' || event.type === 'end' ? (
            <span className="badge badge-success">{event.type}</span>
          ) : event.type === 'boundary' ? (
            <span className="badge badge-primary">{event.type}</span>
          ) : (
            <span className="badge badge-secondary">{event.type}</span>
          )}
          &nbsp;
        </React.Fragment>
      ))}
    </div>
  );
};

export default SpeechSynthesisUtteranceEvent;
