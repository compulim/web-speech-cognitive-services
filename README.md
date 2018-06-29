# web-speech-cognitive-services

[![npm version](https://badge.fury.io/js/web-speech-cognitive-services.svg)](https://badge.fury.io/js/web-speech-cognitive-services) [![Build Status](https://travis-ci.org/compulim/web-speech-cognitive-services.svg?branch=master)](https://travis-ci.org/compulim/web-speech-cognitive-services)

Polyfill Web Speech API with Cognitive Services Speech-to-Text service.

This scaffold is provided by [`react-component-template`](https://github.com/compulim/react-component-template/).

# Demo

Try out our demo at https://compulim.github.io/web-speech-cognitive-services?s=your-subscription-key.

We use [`react-dictate-button`](https://github.com/compulim/react-dictate-button/) to quickly setup the playground.

# Background

Web Speech API is not widely adopted on popular browsers and platforms. Polyfilling the API using cloud services is a great way to enable wider adoption. Nonetheless, Web Speech API in Google Chrome is also backed by cloud services.

Microsoft Azure [Cognitive Services Speech-to-Text](https://azure.microsoft.com/en-us/services/cognitive-services/speech-to-text/) service provide speech recognition with great accuracy. But unfortunately, the APIs are not based on Web Speech API.

This package will polyfill Web Speech API by turning Cognitive Services Speech-to-Text API into Web Speech API. We test this package with popular combination of platforms and browsers.

# How to use

First, run `npm install web-speech-cognitive-services` for latest production build. Or `npm install web-speech-cognitive-services@master` for latest development build.

```jsx
import CognitiveServicesSpeechRecognition from 'web-speech-cognitive-services';

const recognition = new CognitiveServicesSpeechRecognition();

// There are two ways to provide your credential:
// 1. Provide a subscription key (good for prototype, not for production)
// 2. Provide a mechanism to obtain/refresh access token

// If you are using subscription key
recognition.subscriptionKey = 'your subscription key';

// If you are using access token, refreshToken === true, if we are renewing the token, otherwise, false
recognition.tokenFetch = async (authFetchEventID, refreshToken) => {
};

recognition.lang = 'en-US';
recognition.onresult = ({ results }) => {
  console.log(results);
};

recognition.start();
```

## Integrating with React

You can use [`react-dictate-button`](https://github.com/compulim/react-dictate-button/) to integrate speech recognition functionality to your React app.

```jsx
import CognitiveServicesSpeechRecognitionm, { CognitiveServicesSpeechGrammarList } from 'web-speech-recognition-services';
import DictateButton from 'react-dictate-button';

export default props =>
  <DictateButton
    extra={{ subscriptionKey: 'your subscription key' }}
    onDictate={ ({ result }) => alert(result.transcript) }
    speechGrammarList={ CognitiveServicesSpeechGrammarList }
    speechRecognition={ CognitiveServicesSpeechRecognition }
  >
    Start dictation
  </DictateButton>
```

You can also look at our [playground page](packages/playground/src/DictationPane.js) to see how it works.

# Test matrix

Browsers are all latest as of 2018-06-28, except:

* macOS was 10.13.1 (2017-10-31), instead of 10.13.5
   * Since Safari does not support Web Speech API, the test matrix remains the same
* Xbox was tested on Insider build (1806) with Kinect sensor connected
   * The latest Insider build does not support both WebRTC and Web Speech API, so we suspect the production build also does not support both

Quick grab:

* Web Speech API
   * Works on most popular platforms, except iOS. Some requires non-default browser.
   * iOS: None of the popular browsers support Web Speech API
   * Windows: requires Chrome
* Cognitive Services Speech-to-Text
   * Works on default browsers on all popular platforms
   * iOS: Chrome and Edge does not support Cognitive Services (WebRTC)

| Platform             | OS                           | Browser              | Cognitive Services (WebRTC) | Web Speech API                          |
| -                    | -                            | -                    | -                           | -                                       |
| PC                   | Windows 10 (1803)            | Chrome 67.0.3396.99  | Yes                         | Yes                                     |
| PC                   | Windows 10 (1803)            | Edge 42.17134.1.0    | Yes                         | No, `SpeechRecognition` not implemented |
| PC                   | Windows 10 (1803)            | Firefox 61.0         | Yes                         | No, `SpeechRecognition` not implemented |
| MacBook Pro          | macOS High Sierra 10.13.1    | Chrome 67.0.3396.99  | Yes                         | Yes                                     |
| MacBook Pro          | macOS High Sierra 10.13.1    | Safari 11.0.1        | Yes                         | No, `SpeechRecognition` not implemented |
| Apple iPhone X       | iOS 11.4                     | Chrome 67.0.3396.87  | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Apple iPhone X       | iOS 11.4                     | Edge 42.2.2.0        | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Apple iPhone X       | iOS 11.4                     | Safari               | Yes                         | No, `SpeechRecognition` not implemented |
| Apple iPod (6th gen) | iOS 11.4                     | Chrome 67.0.3396.87  | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Apple iPod (6th gen) | iOS 11.4                     | Edge 42.2.2.0        | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Apple iPod (6th gen) | iOS 11.4                     | Safari               | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Google Pixel 2       | Android 8.1.0                | Chrome 67.0.3396.87  | Yes                         | Yes                                     |
| Google Pixel 2       | Android 8.1.0                | Edge 42.0.0.2057     | Yes                         | Yes                                     |
| Google Pixel 2       | Android 8.1.0                | Firefox 60.1.0       | Yes                         | Yes                                     |
| Microsoft Lumia 950  | Windows 10 (1709)            | Edge 40.15254.489.0  | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |
| Microsoft Xbox One   | Windows 10 (1806) 17134.4054 | Edge 42.17134.4054.0 | No, `AudioSourceError`      | No, `SpeechRecognition` not implemented |

## Event lifecycle scenarios

We test multiple scenarios to make sure we polyfill Web Speech API correctly. Following are events and its firing order, in Cognitive Services and Web Speech API respectively.

* [Happy path](#happy-path)
* [Abort during recognition](#abort-during-recognition)
* [Network issues](#network-issues)
* [Audio muted or volume too low](#audio-muted-or-volume-too-low)
* [No speech is recognized](#no-speech-is-recognized)
* [Not authorized to use microphone](#not-authorized-to-use-microphone)

### Happy path

Everything works, including multiple interim results.

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

### Abort during recognition

#### Abort before first recognition is made

* Cognitive Services
   * Essentially muted the microphone and receive `SpeechEndDetectedEvent` immediately, very similar to [happy path](#happy-path), could still result in success, silent, or no match
* Web Speech API
   1. `start`
   2. `audiostart`
   8. `audioend`
   9. `error(error = 'aborted')`
   10. `end`

#### Abort after some text has recognized

* Cognitive Services
   * Essentially muted the microphone and receive `SpeechEndDetectedEvent` immediately, very similar to [happy path](#happy-path), could still result in success, silent, or no match
* Web Speech API
   1. `start`
   2. `audiostart`
   3. `soundstart`
   4. `speechstart`
   5. `result` (one or more)
   6. `speechend`
   7. `soundend`
   8. `audioend`
   9. `error(error = 'aborted')`
   10. `end`

### Network issues

Turn on airplane mode.

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

### Audio muted or volume too low

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

### No speech is recognized

Some sounds are heard, but they cannot be recognized as text. There could be some interim results with recognized text, but the confidence is so low it dropped out of final result.

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

> Note: the Web Speech API has `onnomatch` event, but unfortunately, Google Chrome did not fire this event.

### Not authorized to use microphone

The user click "deny" on the permission dialog, or there are no microphone detected in the system.

* Cognitive Services
   1. `RecognitionTriggeredEvent`
   2. `RecognitionEndedEvent(Result.RecognitionStatus = 'AudioSourceError')`
* Web Speech API
   1. `error(error = 'not-allowed')`
   2. `end`

# Known issues

* Interim results do not return confidence, final result do have confidence
   * We always return `0.5` for interim results
* Cognitive Services support grammar list but not in JSGF format, more work to be done in this area
   * Although Google Chrome support grammar list, it seems the grammar list is not used at all
* Continuous mode does not work

# Roadmap

* [ ] Add grammar list
* [ ] Add tests for lifecycle events
* [ ] Investigate continuous mode

# Contributions

Like us? [Star](https://github.com/compulim/web-speech-cognitive-services/stargazers) us.

Want to make it better? [File](https://github.com/compulim/web-speech-cognitive-services/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/web-speech-cognitive-services/pulls) a pull request.
