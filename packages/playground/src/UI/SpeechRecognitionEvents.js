import { useSelector } from 'react-redux';
import React from 'react';

const SpeechRecognitionEvents = () => {
  const speechRecognitionEvents = useSelector(({ speechRecognitionEvents }) => speechRecognitionEvents);

  return (
    <table className="table table-sm">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Type</th>
          <th scope="col">Details</th>
        </tr>
      </thead>
      <tbody>
        {
          speechRecognitionEvents.map((event, index) =>
            <tr>
              <th scope="row">{ index + 1 }</th>
              <th scope="row">{ event.type }</th>
              <td>
                <pre>{ JSON.stringify(event, null, 2) }</pre>
              </td>
            </tr>
          )
        }
      </tbody>
    </table>
  );
}

export default SpeechRecognitionEvents
