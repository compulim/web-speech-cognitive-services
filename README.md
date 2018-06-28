# web-speech-cognitive-services

[![npm version](https://badge.fury.io/js/we-bspeech-cognitive-services.svg)](https://badge.fury.io/js/we-bspeech-cognitive-services) [![Build Status](https://travis-ci.org/compulim/we-bspeech-cognitive-services.svg?branch=master)](https://travis-ci.org/compulim/web-speech-cognitive-services)

Polyfill Web Speech API with Cognitive Services.

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
