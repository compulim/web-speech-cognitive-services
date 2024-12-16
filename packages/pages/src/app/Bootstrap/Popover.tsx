import { css } from '@emotion/css';
import React, { type ReactNode, useCallback, useEffect, useRef } from 'react';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jQuery(...args: unknown[]): any;
  }
}

const ROOT_CSS = css({
  backgroundColor: 'Transparent',
  border: 0,
  padding: 0
});

type Props = {
  children?: ReactNode | undefined;
  content: string;
  placement: string;
  trigger: string;
};

const Popover = ({ children, content, placement, trigger }: Props) => {
  const createContentElement = useCallback<() => HTMLPreElement>(() => {
    const element = document.createElement('pre');

    element.innerText = content;

    return element;
  }, [content]);

  const ref = useRef<HTMLButtonElement>(null);
  const { current } = ref;

  useEffect(() => {
    window.jQuery(current).popover({
      content: createContentElement(),
      html: true
    });

    return () => window.jQuery(current).popover('dispose');
  }, [content, createContentElement, current]);

  return (
    <button
      className={ROOT_CSS}
      data-placement={placement}
      data-toggle="popover"
      data-trigger={trigger}
      ref={ref}
      type="button"
    >
      {children}
    </button>
  );
};

export default Popover;

export { type Props };
