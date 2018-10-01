# web-speech-cognitive-services

[![npm version](https://badge.fury.io/js/web-speech-cognitive-services.svg)](https://badge.fury.io/js/web-speech-cognitive-services) [![Build Status](https://travis-ci.org/compulim/web-speech-cognitive-services.svg?branch=master)](https://travis-ci.org/compulim/web-speech-cognitive-services)

Polyfill Web Speech API with Cognitive Services Bing Speech for both speech-to-text and text-to-speech service.

This scaffold is provided by [`react-component-template`](https://github.com/compulim/react-component-template/).

# Demo

Try out our demo at https://compulim.github.io/web-speech-cognitive-services?s=your-subscription-key.

We use [`react-dictate-button`](https://github.com/compulim/react-dictate-button/) and [`react-say`](https://github.com/compulim/react-say/) to quickly setup the playground.

# Background

Web Speech API is not widely adopted on popular browsers and platforms. Polyfilling the API using cloud services is a great way to enable wider adoption. Nonetheless, Web Speech API in Google Chrome is also backed by cloud services.

Microsoft Azure [Cognitive Services Bing Speech](https://azure.microsoft.com/en-us/services/cognitive-services/speech/) service provide speech recognition with great accuracy. But unfortunately, the APIs are not based on Web Speech API.

This package will polyfill Web Speech API by turning Cognitive Services Bing Speech API into Web Speech API. We test this package with popular combination of platforms and browsers.

# How to use

First, run `npm install web-speech-cognitive-services` for latest production build. Or `npm install web-speech-cognitive-services@master` for latest development build.

Then, install peer dependency by running `npm install microsoft-speech-browser-sdk`.

## Speech recognition (speech-to-text)

```jsx
import { createFetchTokenUsingSubscriptionKey, SpeechRecognition } from 'web-speech-cognitive-services';

const recognition = new SpeechRecognition();

recognition.lang = 'en-US';
recognition.fetchToken = createFetchTokenUsingSubscriptionKey('your subscription key');

recognition.onresult = ({ results }) => {
  console.log(results);
};

recognition.start();
```

> Note: most browsers requires HTTPS or `localhost` for WebRTC.

### Integrating with React

You can use [`react-dictate-button`](https://github.com/compulim/react-dictate-button/) to integrate speech recognition functionality to your React app.

```jsx
import { createFetchTokenUsingSubscriptionKey, SpeechGrammarList, SpeechRecognition } from 'web-speech-cognitive-services';
import DictateButton from 'react-dictate-button';

const extra = { fetchToken: createFetchTokenUsingSubscriptionKey('your subscription key') };

export default props =>
  <DictateButton
    extra={ extra }
    onDictate={ ({ result }) => alert(result.transcript) }
    speechGrammarList={ SpeechGrammarList }
    speechRecognition={ SpeechRecognition }
  >
    Start dictation
  </DictateButton>
```

You can also look at our [playground page](packages/playground/src/DictationPane.js) to see how it works.

### Speech priming (a.k.a. grammars)

You can prime the speech recognition by giving a list of words.

Since Cognitive Services does not works with weighted grammars, we built another `SpeechGrammarList` to better fit the scenario.

```jsx
import { createFetchTokenUsingSubscriptionKey, SpeechGrammarList, SpeechRecognition } from 'web-speech-cognitive-services';

const recognition = new SpeechRecognition();

recognition.grammars = new SpeechGrammarList();
recognition.grammars.words = ['Tuen Mun', 'Yuen Long'];
recognition.fetchToken = createFetchTokenUsingSubscriptionKey('your subscription key');

recognition.onresult = ({ results }) => {
  console.log(results);
};

recognition.start();
```

> Note: you can also pass `grammars` to `react-dictate-button` via `extra` props.

## Speech synthesis (text-to-speech)

```jsx
import { createFetchTokenUsingSubscriptionKey, speechSynthesis, SpeechSynthesisUtterance } from 'web-speech-cognitive-services';

const fetchToken = createFetchTokenUsingSubscriptionKey('your subscription key');
const utterance = new SpeechSynthesisUtterance('Hello, World!');

speechSynthesis.fetchToken = fetchToken;

// Need to wait until token exchange is complete before speak
await fetchToken();
await speechSynthesis.speak(utterance);
```

> Note: `speechSynthesis` is camel-casing because it is an instance.

`pitch`, `rate`, `voice`, and `volume` are supported. Only `onstart`, `onerror`, and `onend` events are supported.

### Integrating with React

You can use [`react-say`](https://github.com/compulim/react-say/) to integrate speech synthesis functionality to your React app.

```jsx
import { createFetchTokenUsingSubscriptionKey, speechSynthesis, SpeechSynthesisUtterance } from 'web-speech-cognitive-services';
import React from 'react';
import Say from 'react-say';

export default class extends React.Component {
  constructor(props) {
    super(props);

    speechSynthesis.fetchToken = createFetchTokenUsingSubscriptionKey('your subscription key');

    // We call it here to preload the token, the token is cached
    speechSynthesis.fetchToken();

    this.state = { ready: false };
  }

  async componentDidMount() {
    await speechSynthesis.fetchToken();

    this.setState(() => ({ ready: true }));
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

## To-do

* Add `babel-runtime`, `microsoft-speech-browser-sdk`, and `simple-update-in`

## Plan

* General
   * [x] Unified [token exchange mechanism](packages/component/src/util/SubscriptionKey.js)
* Speech recognition
   * [x] Add grammar list
   * [ ] Add tests for lifecycle events
   * [ ] Support `stop()` function
      * Currently, only `abort()` is supported
   * [ ] Investigate continuous mode
   * [ ] Enable Opus (OGG) encoding
      * Currently, there is a problem with `microsoft-speech-browser-sdk@0.0.12`, tracking on [this issue](https://github.com/Azure-Samples/SpeechToText-WebSockets-Javascript/issues/88)
   * [ ] Support custom speech
   * [ ] Support new [Speech-to-Text](https://azure.microsoft.com/en-us/services/cognitive-services/speech-to-text/) service
      * Point to [new URIs](https://docs.microsoft.com/en-us/azure/cognitive-services/Speech-Service/rest-apis)
* Speech synthesis
   * [ ] Event: add `pause`/`resume` support
   * [ ] Properties: add `paused`/`pending`/`speaking` support
   * [ ] Support new [Text-to-Speech](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/how-to-text-to-speech) service
      * Custom voice fonts

# Contributions

Like us? [Star](https://github.com/compulim/web-speech-cognitive-services/stargazers) us.

Want to make it better? [File](https://github.com/compulim/web-speech-cognitive-services/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/web-speech-cognitive-services/pulls) a pull request.
