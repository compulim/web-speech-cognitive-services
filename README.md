# web-speech-cognitive-services

[![npm version](https://badge.fury.io/js/web-speech-cognitive-services.svg)](https://badge.fury.io/js/web-speech-cognitive-services) [![Build Status](https://travis-ci.org/compulim/web-speech-cognitive-services.svg?branch=master)](https://travis-ci.org/compulim/web-speech-cognitive-services)

Polyfill Web Speech API with Cognitive Services.

## Test matrix

Browsers are all latest as of 2018-06-28, except macOS was 10.13.1 (2017-10-31), instead of 10.13.5. But there should be no change on the matrix since Safari does not support Web Speech API.

Overall in point form:

* With Web Speech API only, web dev can enable speech recognition on most popular platforms, except iOS
   * iOS: No browsers on iOS support Web Speech API
   * Some platforms requires non-default browser
* With Cognitive Services Speech-to-Text, all popular platforms with their default browsers are supported
   * iOS: Chrome and Edge does not support Cognitive Services because WebRTC is disabled

| Platform             | OS                        | Browser             | Cognitive Services (WebRTC) | Web Speech API                          |
| -                    | -                         | -                   | -                           | -                                       |
| PC                   | Windows 10 (1803)         | Chrome 67.0.3396.99 | Yes                         | Yes                                     |
| PC                   | Windows 10 (1803)         | Edge 42.17134.1.0   | Yes                         | No, `SpeechRecognition` not implemented |
| PC                   | Windows 10 (1803)         | Firefox 61.0        | Yes                         | No, `SpeechRecognition` not implemented |
| MacBook Pro          | macOS High Sierra 10.13.1 | Chrome 67.0.3396.99 | Yes                         | Yes                                     |
| MacBook Pro          | macOS High Sierra 10.13.1 | Safari 11.0.1       | Yes                         | No, `SpeechRecognition` not implemented |
| Apple iPhone X       | iOS 11.4                  | Chrome 67.0.3396.87 | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Apple iPhone X       | iOS 11.4                  | Edge 42.2.2.0       | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Apple iPhone X       | iOS 11.4                  | Safari              | Yes                         | No, `SpeechRecognition` not implemented |
| Apple iPod (6th gen) | iOS 11.4                  | Chrome 67.0.3396.87 | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Apple iPod (6th gen) | iOS 11.4                  | Edge 42.2.2.0       | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Apple iPod (6th gen) | iOS 11.4                  | Safari              | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Google Pixel 2       | Android 8.1.0             | Chrome 67.0.3396.87 | Yes                         | Yes                                     |
| Google Pixel 2       | Android 8.1.0             | Edge 42.0.0.2057    | Yes                         | Yes                                     |
| Google Pixel 2       | Android 8.1.0             | Firefox 60.1.0      | Yes                         | Yes                                     |
| Microsoft Lumia 950  | Windows 10 (1709)         | Edge 40.15254.489.0 | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Microsoft Xbox One   | Windows 10 (?)            | Edge ?              | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |

## Event lifecycle mapping from Cognitive Services

| # | WebSpeech | Cognitive Services | Notes |
| - | - | - | - |
| 1 | `start` | `RecognitionTriggeredEvent` | |
| 2 | `audiostart` | `ListeningStartedEvent` | |
| 3 | | `ConnectingToServiceEvent` | |
| 4 | `soundstart`, `speechstart` | `RecognitionStartedEvent` | |
| 5 | `onresult(isFinal = false)` | `SpeechHypothesisEvent` | |
| 6 | `speechend`, `soundend`, `audioend` | `SpeechEndDetectedEvent` | `speechend` and `soundend` only fire if either `speechstart` and `soundstart` was fired |
| 7 | `onresult(isFinal = true)`, `onerror` | `SpeechSimplePhraseEvent` | |
| 8 | `end` | `RecognitionEndedEvent` | |

### Scenarios

* Happy path
   * Cognitive Services
      1. `RecognitionTriggeredEvent`
      2. `ListeningStartedEvent`
      3. `ConnectingToServiceEvent`
      4. `RecognitionStartedEvent`
      5. `SpeechHypothesisEvent` (could be more than one)
      6. `SpeechEndDetectedEvent`
      7. `SpeechDetailedPhraseEvent`
      8. `RecognitionEndedEvent`
   * Web Speech API
      1. `start`
      2. `audiostart`
      3. `soundstart`
      4. `speechstart`
      5. `result` (multiple times)
      6. `speechend`
      7. `soundend`
      8. `audioend`
      9. `result(results = [{ isFinal = true }])`
      10. `end`
* Abort is called during recognition
   * Cognitive Services
      * Essentially muted the speech, that could still result in success, silent, or no match
   * Web Speech API
      1. `start`
      2. `audiostart`
      3. `soundstart` (optional)
      4. `speechstart` (optional)
      5. `result` (optional)
      6. `speechend` (optional)
      7. `soundend` (optional)
      8. `audioend`
      9. `error(error = 'aborted')`
      10. `end`
* Network issues
   * Cognitive Services
      1. `RecognitionTriggeredEvent`
      2. `ListeningStartedEvent`
      3. `ConnectingToServiceEvent`
      5. `RecognitionEndedEvent(Result.RecognitionStatus = 'ConnectError')`
   * Web Speech API
      1. `start`
      2. `audiostart`
      3. `audioend`
      4. `error(error = 'network')`
      5. `end`
* Audio muted or volume too low
   * Cognitive Services
      1. `RecognitionTriggeredEvent`
      2. `ListeningStartedEvent`
      3. `ConnectingToServiceEvent`
      4. `RecognitionStartedEvent`
      5. `SpeechEndDetectedEvent`
      6. `SpeechDetailedPhraseEvent(Result.RecognitionStatus = 'InitialSilenceTimeout')`
      7. `RecognitionEndedEvent`
   * Web Speech API
      1. `start`
      2. `audiostart`
      3. `audioend`
      4. `error(error = 'no-speech')`
      5. `end`
* Failed to recognize speech (a.k.a. no match)
   * Cognitive Services
      1. `RecognitionTriggeredEvent`
      2. `ListeningStartedEvent`
      3. `ConnectingToServiceEvent`
      4. `RecognitionStartedEvent`
      5. `SpeechHypothesisEvent` (could be more than one)
      6. `SpeechEndDetectedEvent`
      7. `SpeechDetailedPhraseEvent(Result.RecognitionStatus = 'NoMatch')`
      8. `RecognitionEndedEvent`
   * Web Speech API
      1. `start`
      2. `audiostart`
      3. `soundstart`
      4. `speechstart`
      5. `result`
      6. `speechend`
      7. `soundend`
      8. `audioend`
      9. `end`
* Not authorized to use microphone
   * Cognitive Services
      1. `RecognitionTriggeredEvent`
      2. `RecognitionEndedEvent(Result.RecognitionStatus = 'AudioSourceError')`
   * Web Speech API
      1. `error(error = 'not-allowed')`
      2. `end`

# Contributions

Like us? [Star](https://github.com/compulim/web-speech-cognitive-services/stargazers) us.

Want to make it better? [File](https://github.com/compulim/web-speech-cognitive-services/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/web-speech-cognitive-services/pulls) a pull request.
