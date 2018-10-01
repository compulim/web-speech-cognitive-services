# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Speech Synthesis: Will async fetch speech token instead of throwing exception

### Changed
- Use `babel-runtime` and `babel-plugin-tranform-runtime`, in favor of `babel-polyfill`
- Better error handling on `null` token
- Updated voice list from [https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/supported-languages](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/supported-languages)
- Reliability around cancelling a playing utterance
   - Instead of shutting down the `AudioContext`, we will stop the `AudioBufferSourceNode` for a graceful stop
- Simplify speech token authorization
   - `recognition.fetchToken = async () => return await 'your subscription key';`
   - `recognition.fetchToken = createFetchTokenUsingSubscriptionKey('your subscription key');`
   - `fetchToken` will be called every time a token is required, implementor should cache the token as needed

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
