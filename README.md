# web-speech-cognitive-services

[![npm version](https://badge.fury.io/js/web-speech-cognitive-services.svg)](https://badge.fury.io/js/web-speech-cognitive-services) [![Build Status](https://travis-ci.org/compulim/web-speech-cognitive-services.svg?branch=master)](https://travis-ci.org/compulim/web-speech-cognitive-services)

Polyfill Web Speech API with Cognitive Services Bing Speech for both speech-to-text and text-to-speech service.

This scaffold is provided by [`react-component-template`](https://github.com/compulim/react-component-template/).

# Demo

Try out our demo at https://compulim.github.io/web-speech-cognitive-services?s=your-subscription-key.

We use [`react-dictate-button`](https://github.com/compulim/react-dictate-button/) and [`react-say`](https://github.com/compulim/react-say/) to quickly setup the playground.

# Background

Web Speech API is not widely adopted on popular browsers and platforms. Polyfilling the API using cloud services is a great way to enable wider adoption. Nonetheless, Web Speech API in Google Chrome is also backed by cloud services.

Microsoft Azure [Cognitive Services Bing Speec](https://azure.microsoft.com/en-us/services/cognitive-services/speech/) service provide speech recognition with great accuracy. But unfortunately, the APIs are not based on Web Speech API.

This package will polyfill Web Speech API by turning Cognitive Services Bing Speech API into Web Speech API. We test this package with popular combination of platforms and browsers.

# How to use

First, run `npm install web-speech-cognitive-services` for latest production build. Or `npm install web-speech-cognitive-services@master` for latest development build.

## Speech recognition (speech-to-text)

```jsx
import SpeechRecognition from 'web-speech-cognitive-services';

const recognition = new SpeechRecognition();

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

### Integrating with React

You can use [`react-dictate-button`](https://github.com/compulim/react-dictate-button/) to integrate speech recognition functionality to your React app.

```jsx
import { SpeechGrammarList, SpeechRecognition } from 'web-speech-cognitive-services';
import DictateButton from 'react-dictate-button';

export default props =>
  <DictateButton
    extra={{ subscriptionKey: 'your subscription key' }}
    onDictate={ ({ result }) => alert(result.transcript) }
    speechGrammarList={ SpeechGrammarList }
    speechRecognition={ SpeechRecognition }
  >
    Start dictation
  </DictateButton>
```

You can also look at our [playground page](packages/playground/src/DictationPane.js) to see how it works.

## Speech synthesis (text-to-speech)

```jsx
import { speechSynthesis, SpeechSynthesisUtterance } from 'web-speech-cognitive-services';

const utterance = new SpeechSynthesisUtterance('Hello, World!');

await speechSynthesis.authorize('your subscription key');
await speechSynthesis.speak(utterance);
```

> Note: `speechSynthesis` is camel-casing because it is an instance.

`pitch`, `rate`, `voice`, and `volume` are supported. Only `onstart`, `onerror`, and `onend` events are supported.

### Integrating with React

You can use [`react-say`](https://github.com/compulim/react-say/) to integrate speech synthesis functionality to your React app.

```jsx
import { speechSynthesis, SpeechSynthesisUtterance } from 'web-speech-cognitive-services';
import React from 'react';
import Say from 'react-say';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = { ready: false };
  }

  componentWillMount() {
    // Speech synthesis is not ready to use until authorization complete
    speechSynthesis.authorize('your subscription key').then(() => ({
      this.setState(() => ({ ready: true }));
    }));
  }

  render() {
    return (
      this.state.ready &&
        <Say
          speechSynthesis={ speechSynthesis }
          speechSynthesisUtterance={ SpeechSynthesisUtterance }
          text="Hello, World!"
        />
    );
  }
}
```

# Test matrix

For detailed test matrix, please refer to [`SPEC-RECOGNITION.md`](SPEC-RECOGNITION.md) or [`SPEC-SYNTHESIS.md`](SPEC-SYNTHESIS.md).

# Known issues

* Speech recognition
   * Interim results do not return confidence, final result do have confidence
      * We always return `0.5` for interim results
   * Cognitive Services support grammar list but not in JSGF format, more work to be done in this area
      * Although Google Chrome support grammar list, it seems the grammar list is not used at all
   * Continuous mode does not work
* Speech synthesis
   * `onboundary`, `onmark`, `onpause`, and `onresume` are not supported/fired

# Roadmap

* Speech recognition
   * [ ] Add grammar list
   * [ ] Add tests for lifecycle events
   * [ ] Investigate continuous mode
   * [ ] Enable Opus (OGG) encoding
      * Currently, there is a problem with `microsoft-speech-browser-sdk@0.0.12`, tracking on [this issue](https://github.com/Azure-Samples/SpeechToText-WebSockets-Javascript/issues/88)
* Speech synthesis
   * [ ] Event: add `pause`/`resume` support
   * [ ] Properties: add `paused`/`pending`/`speaking` support
* [ ] Unify token fetch mechanism

# Contributions

Like us? [Star](https://github.com/compulim/web-speech-cognitive-services/stargazers) us.

Want to make it better? [File](https://github.com/compulim/web-speech-cognitive-services/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/web-speech-cognitive-services/pulls) a pull request.
