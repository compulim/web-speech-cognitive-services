"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = subscribeEvent;

function subscribeEvent(target, name, handler) {
  target.addEventListener(name, handler);
  return function () {
    return target.removeEventListener(name, handler);
  };
}
//# sourceMappingURL=subscribeEvent.js.map