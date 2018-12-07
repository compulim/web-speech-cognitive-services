import React from 'react';

export default class extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  componentDidMount() {
    this.refreshInterval(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.interval !== this.props.interval) {
      this.refreshInterval(nextProps);
    }
  }

  componentWillUnmount() {
    this.refreshInterval();
  }

  handleTick() {
    const nextResult = this.props.getValue();

    if (this.state.result !== nextResult) {
      this.setState(() => ({ result: nextResult }));
    }
  }

  refreshInterval(props) {
    this.interval && clearInterval(this.interval);

    if (props) {
      this.interval = setInterval(this.handleTick.bind(this), props.interval || 300);
    }
  }

  render() {
    const {
      props: { children },
      state: { result }
    } = this;

    return (
      <React.Fragment key={ result }>
        { typeof children === 'function' ? children(result) : children }
      </React.Fragment>
    );
  }
}
