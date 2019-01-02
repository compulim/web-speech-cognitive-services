"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _AudioContextQueue = _interopRequireDefault(require("./AudioContextQueue"));

var _fetchVoices = _interopRequireDefault(require("./fetchVoices"));

var _SpeechSynthesisUtterance = _interopRequireDefault(require("./SpeechSynthesisUtterance"));

var DEFAULT_REGION = "westus"; // Supported output format can be found at https://docs.microsoft.com/en-us/azure/cognitive-services/Speech/API-Reference-REST/BingVoiceOutput#Subscription

var DEFAULT_OUTPUT_FORMAT = "audio-16khz-128kbitrate-mono-mp3";

var SpeechSynthesis =
/*#__PURE__*/
function () {
  function SpeechSynthesis() {
    (0, _classCallCheck2.default)(this, SpeechSynthesis);
    this.onvoiceschanged = null;
    this.region = DEFAULT_REGION;
    this.outputFormat = DEFAULT_OUTPUT_FORMAT;
    this.queue = new _AudioContextQueue.default();
  }

  (0, _createClass2.default)(SpeechSynthesis, [{
    key: "cancel",
    value: function cancel() {
      this.queue.stop();
    }
  }, {
    key: "getVoices",
    value: function getVoices() {
      return (0, _fetchVoices.default)();
    }
  }, {
    key: "speak",
    value: function speak(utterance) {
      if (!(utterance instanceof _SpeechSynthesisUtterance.default)) {
        throw new Error("invalid utterance");
      }

      if (!this.fetchToken) {
        throw new Error("SpeechSynthesis: fetchToken must be set");
      } else if (typeof this.fetchToken !== "function") {
        throw new Error("SpeechSynthesis: fetchToken must be a function that returns a Promise and it will resolve to a string-based token");
      }

      utterance.addEventListener("end", resolve);
      utterance.addEventListener("error", reject);
      utterance.accessToken = this.fetchToken();
      utterance.region = this.region;
      utterance.outputFormat = this.outputFormat;
      utterance.preload();
      this.queue.push(utterance);
    }
  }]);
  return SpeechSynthesis;
}();

var _default = new SpeechSynthesis();

exports.default = _default;
//# sourceMappingURL=speechSynthesis.js.map