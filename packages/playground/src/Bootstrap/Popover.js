import { css } from 'glamor';
import React, { useCallback, useEffect, useRef } from 'react';

const ROOT_CSS = css({
  backgroundColor: 'Transparent',
  border: 0,
  padding: 0
});

const Popover = ({
  children,
  content,
  placement,
  trigger
}) => {
  const createContentElement = useCallback(() => {
    const element = document.createElement('pre');

    element.innerText = content;

    return element;
  }, [content]);

  const ref = useRef();
  const { current } = ref;

  useEffect(() => {
    window.jQuery(current).popover({
      content: createContentElement(content),
      html: true
    });

    return () => window.jQuery(current).popover('dispose');
  }, [content, createContentElement, current]);

  return (
    <button
      className={ ROOT_CSS }
      data-placement={ placement }
      data-toggle="popover"
      data-trigger={ trigger }
      ref={ ref }
      type="button"
    >{ children }</button>
  );
};

export default Popover
