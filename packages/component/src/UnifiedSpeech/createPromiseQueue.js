import createDeferred from './createDeferred';

export default function () {
  let peekDeferred;
  let shiftDeferred;
  const queue = [];

  const push = value => {
    if (peekDeferred) {
      const { resolve } = peekDeferred;

      peekDeferred = null;
      resolve(value);
    }

    if (shiftDeferred) {
      const { resolve } = shiftDeferred;

      shiftDeferred = null;
      resolve(value);
    } else {
      queue.push(value);
    }
  };

  const peek = () => {
    if (queue.length) {
      return Promise.resolve(queue[0]);
    } else {
      return (peekDeferred || (peekDeferred = createDeferred())).promise;
    }
  };

  const shift = () => {
    if (queue.length) {
      return Promise.resolve(queue.shift());
    } else {
      return (shiftDeferred || (shiftDeferred = createDeferred())).promise;
    }
  };

  return {
    peek,
    push,
    shift
  }
}
