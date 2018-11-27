import { connect } from 'react-redux';
import React from 'react';

const SpeechRecognitionSimpleEvents = ({
  speechRecognitionEvents
}) =>
  <ol className="list-unstyled">
    {
      speechRecognitionEvents.map((event, index) =>
        <li key={ index }>
          <span className="badge">{ index + 1 }</span>&nbsp;
          {
            event.type === 'start' || event.type === 'end' ?
              <span className="badge badge-primary">{ event.type }</span>
            : event.type === 'audiostart' || event.type === 'audioend' ?
              <span className="badge badge-success">{ event.type }</span>
            : event.type === 'soundstart' || event.type === 'soundend' ?
              <span className="badge badge-warning">{ event.type }</span>
            : event.type === 'speechstart' || event.type === 'speechend' ?
              <span className="badge badge-danger">{ event.type }</span>
            : event.type === 'result' ?
              <span>
                <span className="badge badge-info">{ event.type }</span>
                <span>&nbsp;
                  {
                    [].map.call(event.results, (result, index) =>
                      <React.Fragment key={ index }>
                        <div style={{ display: 'inline-block' }}>
                          { !!result.isFinal &&
                            <React.Fragment>
                              <span className="badge badge-dark">isFinal</span>&nbsp;
                            </React.Fragment>
                          }
                          {
                            [].map.call(result, ({ confidence, transcript }, index) =>
                              <React.Fragment>
                                <span
                                  className="badge badge-pill badge-primary"
                                  key={ index }
                                >{ transcript }</span>
                                &nbsp;
                                <span
                                  className="badge badge-pill badge-success"
                                  key={ index }
                                >{ Math.round(confidence * 100) }%</span>
                                <br />
                              </React.Fragment>
                            )
                          }
                        </div>
                        &nbsp;
                      </React.Fragment>
                    )
                  }
                </span>
              </span>
            : event.type === 'nomatch' ?
              <span className="badge badge-info">{ event.type }</span>
            : event.type === 'error' ?
              <React.Fragment>
                <span className="badge badge-dark">{ event.type }</span>&nbsp;
                { event.error }
              </React.Fragment>
            : event.type === 'cognitiveservices' ?
              <span className="badge badge-light">{ event.type }:{ event.subType }</span>
            :
              <span className="badge badge-secondary">{ event.type }</span>
          }
        </li>
      )
    }
  </ol>

export default connect(
  ({ speechRecognitionEvents }) => ({ speechRecognitionEvents })
)(SpeechRecognitionSimpleEvents)
