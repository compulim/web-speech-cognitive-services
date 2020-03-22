import { css } from 'glamor';
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
      src="https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png"
    />
  </a>
);
