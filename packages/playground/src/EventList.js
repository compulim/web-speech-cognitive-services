import { css } from 'glamor';
import React from 'react';

const ROOT_CSS = css({
  '& > tbody > tr': {
    '& > th': {
      backgroundColor: '#EEE'
    }
  }
});

export default class EventList extends React.Component {
  constructor(props) {
    super(props);

    this.handleEvent = this.handleEvent.bind(this);

    this.state = {
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

  attach({ events, target } = {}, { events: nextEvents, target: nextTarget } = {}) {
    target && (events || []).forEach(event => target.removeEventListener(event, this.handleEvent));
    nextTarget && (nextEvents || []).forEach(event => nextTarget.addEventListener(event, this.handleEvent));
  }

  handleEvent(event) {
    this.setState(({ events }) => ({
      events: [...events, event]
    }));
  }

  render() {
    const { props: { children }, state: { events } } = this;
    const customRender = typeof children === 'function' ? children : event => <pre>{ JSON.stringify(event, null, 2) }</pre>;

    return (
      <table className={ ROOT_CSS }>
        <tbody>
          { events.map((event, index) =>
            <tr key={ index }>
              <th>{ event.type }</th>
              <td>
                { customRender(event) }
              </td>
            </tr>
          ) }
        </tbody>
      </table>
    );
  }
}
