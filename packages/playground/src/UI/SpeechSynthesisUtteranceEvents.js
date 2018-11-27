import { connect } from 'react-redux';
import React from 'react';

const SpeechSynthesisUtteranceEvent = ({
  events
}) =>
  <div>
    {
      events.map((event, index) =>
        <React.Fragment key={ index }>
          {
            event.type === 'start'
            || event.type === 'end' ?
              <span className="badge badge-success">{ event.type }</span>
            : event.type === 'boundary' ?
              <span className="badge badge-primary">{ event.type }</span>
            :
              <span className="badge badge-secondary">{ event.type }</span>
          }
          &nbsp;
        </React.Fragment>
      )
    }
  </div>

export default connect(
  ({
    speechSynthesisUtterances
  }, {
    utteranceID
  }) => ({
    events: (speechSynthesisUtterances.find(({ id }) => id === utteranceID) || {}).events || []
  })
)(SpeechSynthesisUtteranceEvent)
