import { css } from 'glamor';
import React from 'react';

const ROOT_CSS = css({
  '& > tbody > tr': {
    '& > th': {
      backgroundColor: '#EEE'
    }
  }
});

function stringifyEvent(event) {
  let keys;
  const json = {};

  if (event.type !== 'cognitiveservices') {
    keys = ['emma', 'error', 'interpretation', 'resultIndex', 'results'];
  } else {
    keys = Object.keys(event);
  }

  keys.forEach(name => {
    if (name === 'results') {
      json.results = event.results && [].map.call(event.results, result => {
        const nextResult = {
          isFinal: result.isFinal,
          length: result.length
        };

        [].forEach.call(result, ({ confidence, transcript }, index) => {
          nextResult[index] = { confidence, transcript };
        });

        return nextResult;
      });
    } else {
      json[name] = event[name];
    }
  });

  return JSON.stringify(json, null, 2);
}

const GROUP_WITHIN = 100;

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      columns: [],
      events: []
    };
  }

  componentDidMount() {
    this.attach(undefined, this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.attach(this.props, nextProps);
  }

  componentWillUnmount() {
    this.attach(this.props, undefined);
  }

  attach({ events, targets } = {}, { events: nextEvents, targets: nextTargets } = {}) {
    targets && Object.keys(targets).forEach(targetName => {
      const target = targets[targetName];

      (events || []).forEach(event => target.removeEventListener(event, this.handleEvent.bind(this, targetName)));
    });

    if (nextTargets) {
      Object.keys(nextTargets).forEach(nextTargetName => {
        const nextTarget = nextTargets[nextTargetName];

        (nextEvents || []).forEach(event => nextTarget.addEventListener(event, this.handleEvent.bind(this, nextTargetName)));
      });

      this.setState(({ columns }) => {
        const nextColumns = [...columns];

        Object.keys(nextTargets).forEach(nextTargetName => {
          if (!~nextColumns.indexOf(nextTargetName)) {
            nextColumns.push(nextTargetName);
          }
        });

        return { columns: nextColumns };
      });
    }
  }

  handleEvent(targetName, event) {
    const now = Date.now();

    console.log(event);

    this.setState(({ events }) => ({
      events: [...events, {
        event,
        now,
        targetName
      }]
    }));
  }

  render() {
    const { props: { children }, state: { columns } } = this;
    const customRender = typeof children === 'function' ? children : event => event && <pre>{ stringifyEvent(event) }</pre>;
    const table = [];
    let lastRow, lastRowTime;

    this.state.events.forEach(({ event, now, targetName }) => {
      const columnIndex = columns.indexOf(targetName);
      let row;

      if (now - lastRowTime < GROUP_WITHIN && !lastRow[columnIndex]) {
        row = lastRow;
      } else {
        row = new Array(columns.length).fill(false);
        table.push(row);
      }

      row[columnIndex] = event;
      lastRow = row;
      lastRowTime = now;
    });

    return (
      <table className={ ROOT_CSS }>
        <colgroup>
          <col width="50%" />
          <col width="50%" />
        </colgroup>
        <thead>
          <tr>
            { columns.map(name =>
              <th key={ name }>{ name }</th>
            ) }
          </tr>
        </thead>
        <tbody>
          { table.map((row, index) =>
            <React.Fragment key={ index }>
              <tr>
                { row.map((cell, index) =>
                  <th key={ index }>{ cell && cell.type }</th>
                ) }
              </tr>
              <tr>
                { row.map((cell, index) =>
                  <td key={ index }>
                    { customRender(cell) }
                  </td>
                ) }
              </tr>
            </React.Fragment>
          ) }
        </tbody>
      </table>
    );
  }
}
