# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- `playground`: Add delayed start to playground for testing speech recognition initiated outside of user gestures, in PR [#78](https://github.com/compulim/web-speech-congitive-services/pull/78)

### Fixed

- Speech recognition: Removed extraneous finalized `result` event in continuous mode, by [@compulim](https://github.com/compulim), in PR [#79](https://github.com/compulim/web-speech-cognitive-services/pull/79)

### Added

- Speech recognition: New `looseEvents` option, default is `false`. When enabled, we will no longer follow observed browser event order. We will send finalized `result` event as early as possible. This will not break conformance to W3C specifications. By [@compulim](https://github.com/compulim), in PR [#79](https://github.com/compulim/web-speech-cognitive-services/pull/79)
- Speech recognition: Create ponyfill using `SpeechRecognizer` object of [`microsoft-cognitiveservices-speech-sdk`](https://npmjs.com/package/microsoft-cognitiveservices-speech-sdk), by [@compulim](https://github.com/compulim), in PR [#XXX](https://github.com/compulim/web-speech-cognitive-services/pull/XXX)

## [5.0.1] - 2019-10-25

### Changed

- Fixed dependences in PR [#76](https://github.com/compulim/web-speech-cognitive-services/pull/76)
   - `bundle` package
      - `dependencies`: Moved `eslint` to development dependencies
   - `component` package
      - `peerDependencies`: No longer requires `react`
      - `dependencies`
         - Moved `eslint` to development dependencies
         - Removed `event-target-shim` because incompatibility with ES5
      - `devDependencies`: Removed `react`
   - Removed `import '@babel/runtime'` explicitly

## [5.0.0] - 2019-10-23

### Breaking changes

- Instead of stopping `AudioContext` after all pending utterances are finished, the `AudioContext` is now persisted. If this is not desirable in your application and would like to control the lifetime of `AudioContext` object, please create your own instance and pass it as an option named `audioContext` when creating the ponyfill
- `createSpeechServicesPonyfill` function is no longer asynchronous
   - Immediate after the ponyfill is created, we will fetch voice list from the services and emit `voiceschanged` event on completion

### Added

- Speech recognition: Fix [#23](https://github.com/compulim/web-speech-cognitive-services/issues/23) and [#24](https://github.com/compulim/web-speech-cognitive-services/issues/24), support `audiostart`/`audioend`/`soundstart`/`soundend` event, in PR [#33](https://github.com/compulim/web-speech-cognitive-services/pull/33)
- Speech recognition: Fix [#25](https://github.com/compulim/web-speech-cognitive-services/issues/25) and [#26](https://github.com/compulim/web-speech-cognitive-services/issues/26), support true `abort` and `stop` function, in PR [#33](https://github.com/compulim/web-speech-cognitive-services/pull/33)
- Speech recognition: Fix [#29](https://github.com/compulim/web-speech-cognitive-services/issues/29), support continuous mode, in PR [#33](https://github.com/compulim/web-speech-cognitive-services/pull/33)
   - Quirks: in continuous mode, calling `stop` in-between `recognizing` and `recognized` will not emit final `result` event
- Speech recognition: New `audioConfig` option to override the default `AudioConfig.fromDefaultMicrophoneInput`, in PR [#33](https://github.com/compulim/web-speech-cognitive-services/pull/33)
- Speech synthesis: Fix [#32](https://github.com/compulim/web-speech-cognitive-services/issues/32), fetch voices from services, in PR [#35](https://github.com/compulim/web-speech-cognitive-services/pull/35)
- Speech synthesis: Fix [#34](https://github.com/compulim/web-speech-cognitive-services/issues/34), in PR [#36](https://github.com/compulim/web-speech-cognitive-services/pull/36) and PR [#44](https://github.com/compulim/web-speech-cognitive-services/pull/44)
   - Support user-controlled `AudioContext` object to be passed as an option named `audioContext`
   - If no `audioContext` option is passed, will create a new `AudioContext` object on first synthesis
- Speech synthesis: If an empty utterance is being synthesized, will play an local empty audio clip, in PR [#36](https://github.com/compulim/web-speech-cognitive-services/pull/36)
- Speech recognition: Fix [#30](https://github.com/compulim/web-speech-cognitive-services/issues/30), support dynamic phrases, in PR [#37](https://github.com/compulim/web-speech-cognitive-services/pull/37)
   - Pass it as an array to `SpeechRecognition.grammars.phrases`
- Speech recognition: Fix [#31](https://github.com/compulim/web-speech-cognitive-services/issues/31), support reference grammars, in PR [#37](https://github.com/compulim/web-speech-cognitive-services/pull/37)
   - When creating the ponyfill, pass it as an array to `referenceGrammars` options
- Speech recognition: Fix [#27](https://github.com/compulim/web-speech-cognitive-services/issues/27), support custom speech, in PR [#41](https://github.com/compulim/web-speech-cognitive-services/pull/41)
   - Use option `speechRecognitionEndpointId`
- Speech synthesis: Fix [#28](https://github.com/compulim/web-speech-cognitive-services/issues/28) and [#62](https://github.com/compulim/web-speech-cognitive-services/issues/62), support custom voice font, in PR [#41](https://github.com/compulim/web-speech-cognitive-services/pull/41) and PR [#67](https://github.com/compulim/web-speech-cognitive-services/pull/67)
   - Use option `speechSynthesisDeploymentId`
   - Voice list is only fetch when using subscription key
- Speech synthesis: Fix [#48](https://github.com/compulim/web-speech-cognitive-services/issues/48), support output format through `outputFormat` option, in PR [#49](https://github.com/compulim/web-speech-cognitive-services/pull/49)
- `*`: Fix [#47](https://github.com/compulim/web-speech-cognitive-services/issues/47), add `enableTelemetry` option for disabling collecting telemetry data in Speech SDK, in PR [#51](https://github.com/compulim/web-speech-cognitive-services/pull/51) and PR [#66](https://github.com/compulim/web-speech/cognitive-services/pull/66)
- `*`: Fix [#53](https://github.com/compulim/web-speech-cognitive-services/issues/53), added ESLint, in PR [#54](https://github.com/compulim/web-speech-cognitive-services/pull/54)
- Speech synthesis: Fix [#39](https://github.com/compulim/web-speech-cognitive-services/issues/39), support SSML utterance, in PR [#57](https://github.com/compulim/web-speech-cognitive-services/pull/57)
- Speech recognition: Fix [#59](https://github.com/compulim/web-speech-cognitive-services/issues/59), support `stop()` function by finalizing partial speech, in PR [#60](https://github.com/compulim/web-speech-cognitive-services/pull/60)
- Fix [#67](https://github.com/compulim/web-speech-cognitive-services/issues/67), add warning when using subscription key instead of authorization token, in PR [#69](https://github.com/compulim/web-speech-cognitive-services/pull/69)
- Fix [#70](https://github.com/compulim/web-speech-cognitive-services/issues/70), fetch authorization token before every synthesis, in PR [#71](https://github.com/compulim/web-speech-cognitive-services/pull/71)

### Changed

- Bumped dependencies, in PR [#20](https://github.com/compulim/web-speech-cognitive-services/pull/20)
   - [@babel/cli@^7.5.5](https://www.npmjs.com/package/@babel/cli)
   - [@babel/core@^7.5.5](https://www.npmjs.com/package/@babel/core)
   - [@babel/plugin-proposal-object-rest-spread@^7.5.5](https://www.npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
   - [@babel/plugin-transform-runtime@^7.5.5](https://www.npmjs.com/package/@babel/plugin-transform-runtime)
   - [@babel/preset-env@^7.5.5](https://www.npmjs.com/package/@babel/preset-env)
   - [@babel/runtime@^7.5.5](https://www.npmjs.com/package/@babel/runtime)
   - [babel-jest@^24.8.0](https://www.npmjs.com/package/babel-jest)
   - [babel-plugin-transform-inline-environment-variables@^0.4.3](https://www.npmjs.com/package/babel-plugin-transform-inline-environment-variables)
   - [jest@^24.8.0](https://www.npmjs.com/package/jest)
   - [memoize-one@^5.0.5](https://www.npmjs.com/package/memoize-one)
   - [rimraf@^2.6.3](https://www.npmjs.com/package/rimraf)
   - [simple-update-in@^2.1.0](https://www.npmjs.com/package/simple-update-in)
- Added version number as `<meta>` tag, in PR [#20](https://github.com/compulim/web-speech-cognitive-services/pull/20)
- Added bundle distribution thru https://unpkg.com/web-speech-cognitive-services@latest/umd/, in PR [#21](https://github.com/compulim/web-speech-cognitive-services/pull/21)
- Bumped to [microsoft-cognitiveservices-speech-sdk@1.6.0](https://www.npmjs.com/package/microsoft-cognitiveservices-speech-sdk), in PR [#22](https://github.com/compulim/web-speech-cognitive-services/pull/22)
- Fix [#55](https://github.com/compulim/web-speech-cognitive-services/issues/55) and [#63](https://github.com/compulim/web-speech-cognitive-services/issues/63). Moves to [WHATWG `EventTarget` interface](https://dom.spec.whatwg.org/#interface-eventtarget), in PR [#56](https://github.com/compulim/web-speech-cognitive-services/pulls/56) and PR [#64](https://github.com/compulim/web-speech-cognitive-services/pulls/64)
- Instead of including `event-target-shim@5.0.1`, we are adopting its source code, in PR [#72](https://github.com/compulim/web-speech-cognitive-services/pulls/72)
   - This is because the original package requires browser to support rest/spread operators

### Fixed

- Fix [#45](https://github.com/compulim/web-speech-cognitive-services/issues/45). Speech synthesize should emit "start" and "error" if the synthesized audio clip cannot be fetch over the network, in PR [#46](https://github.com/compulim/web-speech-cognitive-services/issues/46)

## [4.0.0] - 2018-12-10
### Added
- New playground for better debuggability
- Support of Speech Services SDK, with automated unit tests for speech recognition
   - See [`SPEC-RECOGNITION.md`](SPEC-RECOGNITION.md) and [`SPEC-SYNTHESIS.md`](SPEC-SYNTHESIS.md) for quirks
- Speech recognition: Support `stop` on Speech Services
- Speech synthesis: Support `pause` and `resume` (with `pause` and `resume` event)
- Speech synthesis: Support `speaking` property

### Changed
- Ponyfill are now constructed based on options (authorization token, region, and subscription key)
   - A new set of ponyfill will be created every time an option has changed

### Fixed
- Fix [#13](https://github.com/compulim/web-speech-cognitive-services/issues/13) Speech recognition: `SpeechRecognitionResult` should be iterable

## [3.0.0] - 2018-10-31
### Added
- Speech Synthesis: Will async fetch speech token instead of throwing exception

### Changed
- Use `@babel/runtime` and `@babel/plugin-tranform-runtime`, in favor of `babel-polyfill`
- Better error handling on `null` token
- Updated voice list from [https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/supported-languages](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/supported-languages)
- Reliability around cancelling a playing utterance
   - Instead of shutting down the `AudioContext`, we will stop the `AudioBufferSourceNode` for a graceful stop
- Simplify speech token authorization
   - `recognition.fetchToken = async () => return await 'your subscription key';`
   - `recognition.fetchToken = createFetchTokenUsingSubscriptionKey('your subscription key');`
   - `fetchToken` will be called every time a token is required, implementor should cache the token as needed
- Bump to [`@babel/core@7.1.2`](https://npmjs.com/package/@babel/core/v/7.1.2) and [`jest@^23.6.0`](https://npmjs.com/package/jest/v/23.6.0)
- Bump to [`react-scripts@2.0.4`](https://npmjs.com/package/react-scripts/v/2.0.4)
- Publish `/packages/component/` instead of `/`
- Bump to [`event-as-promise@1.0.5`](https://npmjs.com/package/event-as-promise/v/1.0.5)

## [2.1.0] - 2018-07-09
### Added
- Speech priming via custom `SpeechGrammarList`

## [2.0.0] - 2018-07-09
### Added
- SpeechSynthesis polyfill with Cognitive Services

### Changed
- Removed `CognitiveServices` prefix
   - Renamed `CognitiveServicesSpeechGrammarList` to `SpeechGrammarList`
   - Renamed `CognitiveServicesSpeechRecognition` to `SpeechRecognition`
   - Removed default export, now must use `import { SpeechRecognition } from 'web-speech-cognitive-services';`
- Speech Recognition: changed speech token authorization
   - `recognition.speechToken = new SubscriptionKey('your subscription key');`

## [1.0.0] - 2018-06-29
### Added
- Initial release
- SpeechRecognition polyfill with Cognitive Services
