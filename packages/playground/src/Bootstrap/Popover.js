import { css } from 'glamor';
import memoize from 'memoize-one';
import React from 'react';

const ROOT_CSS = css({
  backgroundColor: 'Transparent',
  border: 0,
  padding: 0
});

export default class extends React.Component {
  constructor() {
    super();

    this.createContentElement = memoize(content => {
      const element = document.createElement('pre');

      element.innerText = content;

      return element;
    });

    this.ref = React.createRef();
  }

  componentDidMount() {
    window.jQuery(this.ref.current).popover({
      content: this.createContentElement(this.props.content),
      html: true
    });
  }

  componentWillReceiveProps({ content: nextContent }) {
    if (this.props.content !== nextContent) {
      window.jQuery(this.ref.current).popover({ content: this.createContentElement(nextContent) });
    }
  }

  componentWillUnmount() {
    window.jQuery(this.ref.current).popover('dispose');
  }

  render() {
    const {
      props: {
        children,
        placement,
        trigger
      }
    } = this;

    return (
      <button
        className={ ROOT_CSS }
        data-placement={ placement }
        data-toggle="popover"
        data-trigger={ trigger }
        ref={ this.ref }
        type="button"
      >{ children }</button>
    );
  }
}
