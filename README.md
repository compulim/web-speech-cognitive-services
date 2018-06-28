# web-speech-cognitive-services

[![npm version](https://badge.fury.io/js/we-bspeech-cognitive-services.svg)](https://badge.fury.io/js/we-bspeech-cognitive-services) [![Build Status](https://travis-ci.org/compulim/we-bspeech-cognitive-services.svg?branch=master)](https://travis-ci.org/compulim/web-speech-cognitive-services)

Polyfill Web Speech API with Cognitive Services.

## Test matrix

| Platform             | OS                | Browser             | Cognitive Services (WebRTC) | Web Speech API                          |
| -                    | -                 | -                   | -                           | -                                       |
| PC                   | Windows 10 (1803) | Chrome 67.0.3396.99 | Yes                         | Yes                                     |
| PC                   | Windows 10 (1803) | Edge 42.17134.1.0   | Yes                         | No, `SpeechRecognition` not implemented |
| PC                   | Windows 10 (1803) | Firefox 61.0        | Yes                         | No, `SpeechRecognition` not implemented |
| Apple iPhone X       | iOS 11.4          | Chrome 67.0.3396.87 | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Apple iPhone X       | iOS 11.4          | Edge 42.2.2.0       | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Apple iPhone X       | iOS 11.4          | Safari              | Yes                         | No, `SpeechRecognition` not implemented |
| Apple iPod (6th gen) | iOS 11.4          | Chrome 67.0.3396.87 | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Apple iPod (6th gen) | iOS 11.4          | Edge 42.2.2.0       | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Apple iPod (6th gen) | iOS 11.4          | Safari              | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Google Pixel 2       | Android 8.1.0     | Chrome 67.0.3396.87 | Yes                         | Yes                                     |
| Google Pixel 2       | Android 8.1.0     | Edge 42.0.0.2057    | Yes                         | Yes                                     |
| Google Pixel 2       | Android 8.1.0     | Firefox 60.1.0      | Yes                         | Yes                                     |
| Microsoft Lumia 950  | Windows 10 (1709) | Edge 40.15254.489.0 | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |

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
   1. `RecognitionTriggeredEvent`
   2. `ListeningStartedEvent`
   3. `ConnectingToServiceEvent`
   4. `RecognitionStartedEvent`
   5. `SpeechHypothesisEvent` (could be more than one)
   6. `SpeechEndDetectedEvent`
   7. `SpeechSimplePhraseEvent`
   8. `RecognitionEndedEvent`
* Network issues
   1. `RecognitionTriggeredEvent`
   2. `ListeningStartedEvent`
   3. `ConnectingToServiceEvent`
   4. `SpeechSimplePhraseEvent`
   5. `RecognitionEndedEvent`
* Audio muted or volume too low
   1. `RecognitionTriggeredEvent`
   2. `ListeningStartedEvent`
   3. `ConnectingToServiceEvent`
   4. `RecognitionStartedEvent`
   5. `SpeechEndDetectedEvent`
   6. `SpeechSimplePhraseEvent(Result.RecognitionStatus = 'InitialSilenceTimeout')`
   7. `RecognitionEndedEvent`
* Failed to recognize speech (a.k.a. no match)
   1. `RecognitionTriggeredEvent`
   2. `ListeningStartedEvent`
   3. `ConnectingToServiceEvent`
   4. `RecognitionStartedEvent`
   5. `SpeechHypothesisEvent` (could be more than one)
   6. `SpeechEndDetectedEvent`
   7. `SpeechSimplePhraseEvent(Result.RecognitionStatus = 'NoMatch')`
   8. `RecognitionEndedEvent`
* User abort
   * Essentially muted the speech, that could result in success, silent, or no match
* Not authorized to use microphone
   1. `RecognitionTriggeredEvent`
   2. `RecognitionEndedEvent(Result.RecognitionStatus = 'AudioSourceError')`

# Contributions

Like us? [Star](https://github.com/compulim/we-bspeech-cognitive-services/stargazers) us.

Want to make it better? [File](https://github.com/compulim/we-bspeech-cognitive-services/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/web-speech-cognitive-services/pulls) a pull request.
