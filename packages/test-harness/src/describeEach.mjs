import { describe } from 'node:test';
import { format } from 'util';

function describe_(describe, rows) {
  return (
    /** @type {string} */
    message,
    fn
  ) => {
    for (const row of rows) {
      const countFormatting = message.replaceAll('%%', '').split('%').length - 1;

      describe(format(message, ...row.slice(0, countFormatting)), () => fn(...row));
    }
  };
}

function describeEach(rows) {
  return describe_(describe, rows);
}

describeEach.only = function only(rows) {
  return describe_(describe.only, rows);
};

export { describeEach };
