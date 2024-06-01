import { css } from '@emotion/css';
import React from 'react';

const FORK_ME_CSS = css({
  border: 0,
  position: 'fixed',
  right: 0,
  top: 0
});

export default ({ owner, repo }) => (
  <a href={`https://github.com/${encodeURI(owner)}/${encodeURI(repo)}`} rel="noopener noreferrer" target="_blank">
    <img
      alt="Fork me on GitHub"
      className={FORK_ME_CSS}
      src="https://github.blog/wp-content/uploads/2008/12/forkme_right_gray_6d6d6d.png?resize=149%2C149"
    />
  </a>
);
