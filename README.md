# web-speech-cognitive-services

Web Speech API adapter to use Cognitive Services Speech Services for both speech-to-text and text-to-speech service.

> This scaffold is provided by [`react-component-template`](https://github.com/compulim/react-component-template/).

[![npm version](https://badge.fury.io/js/web-speech-cognitive-services.svg)](https://badge.fury.io/js/web-speech-cognitive-services) [![Build Status](https://travis-ci.org/compulim/web-speech-cognitive-services.svg?branch=master)](https://travis-ci.org/compulim/web-speech-cognitive-services)

# Demo

Try out our demo at https://compulim.github.io/web-speech-cognitive-services?s=your-subscription-key.

We use [`react-dictate-button`](https://github.com/compulim/react-dictate-button/) and [`react-say`](https://github.com/compulim/react-say/) to quickly setup the playground.

# Background

Web Speech API is not widely adopted on popular browsers and platforms. Polyfilling the API using cloud services is a great way to enable wider adoption. Nonetheless, Web Speech API in Google Chrome is also backed by cloud services.

Microsoft Azure [Cognitive Services Speech Services](https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/) service provide speech recognition with great accuracy. But unfortunately, the APIs are not based on Web Speech API.

This package will polyfill Web Speech API by turning Cognitive Services Speech Services API into Web Speech API. We test this package with popular combination of platforms and browsers.

# How to use

For production build, run `npm install web-speech-cognitive-services`.

For development build, run `npm install web-speech-cognitive-services@master`.

> Since [Speech Services SDK](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/quickstart-js-browser) is not on NPM yet, we will bundle the SDK inside this package for now. When Speech Services SDK release on NPM, we will define it as a peer dependency.

## Polyfilling vs. ponyfilling

In JavaScript, polyfill is a technique to bring newer features to older environment. Ponyfill is very similar, but instead polluting the environment by default, we prefer to let the developer to choose what they want. This [article](https://ponyfoo.com/articles/polyfills-or-ponyfills) talks about polyfill vs. ponyfill.

In this package, we prefer ponyfill because it do not pollute the hosting environment. You are also free to mix-and-match multiple speech recognition engines under a single environment.

# Code snippets

> For readability, we omitted the async function in all code snippets. To run the code, you will need to wrap the code using an async function.

## Polyfilling the environment

If the library you are using do not support ponyfill, you can polyfill `window` object with our ponyfill.

```jsx
import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

const ponyfill = await createPonyfill({
  region: 'westus',
  subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
});

for (let key in ponyfill) {
  window[key] = ponyfill[key];
}
```

> Note: if you do not specify `region`, we will default to `"westus"`.

> List of supported regions can be found in [this article](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-apis#regions-and-endpoints).

> If you prefer to use the deprecating Bing Speech, import from `'web-speech-cognitive-services/lib/BingSpeech'` instead.

## Using authorization token

Instead of exposing subscription key on the browser, we strongly recommend using authorization token.

```jsx
import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

const ponyfill = await createPonyfill({
  authorizationToken: 'YOUR_AUTHORIZATION_TOKEN',
  region: 'westus',
});
```

You can also provide an async function that will fetch the authorization token on-demand. You should cache the authorization token for subsequent request.

```jsx
import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

const ponyfill = await createPonyfill({
  authorizationToken: fetch('https://example.com/your-token').then(res => res.text()),
  region: 'westus',
});
```

## Speech recognition (speech-to-text)

You can choose to only create ponyfill for speech recognition.

```jsx
import { createSpeechRecognitionPonyfill } from 'web-speech-cognitive-services/lib/SpeechServices/SpeechToText';

const {
  SpeechRecognition
} = await createSpeechRecognitionPonyfill({
  region: 'westus',
  subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
});

const recognition = new SpeechRecognition();

recognition.interimResults = true;
recognition.lang = 'en-US';

recognition.onresult = ({ results }) => {
  console.log(results);
};

recognition.start();
```

> Note: most browsers requires HTTPS or `localhost` for WebRTC.

### Integrating with React

You can use [`react-dictate-button`](https://github.com/compulim/react-dictate-button/) to integrate speech recognition functionality to your React app.

```jsx
import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';
import DictateButton from 'react-dictate-button';

const {
  SpeechGrammarList,
  SpeechRecognition
} = await createPonyfill({
  region: 'westus',
  subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
});

export default props =>
  <DictateButton
    onDictate={ ({ result }) => alert(result.transcript) }
    speechGrammarList={ SpeechGrammarList }
    speechRecognition={ SpeechRecognition }
  >
    Start dictation
  </DictateButton>
```

### Speech priming (a.k.a. grammars)

> This section is currently not implemented with new Speech SDK. We are leaving the section here for future reference.

You can prime the speech recognition by giving a list of words.

Since Cognitive Services does not works with weighted grammars, we built another `SpeechGrammarList` to better fit the scenario.

```jsx
import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

const {
  SpeechGrammarList,
  SpeechRecognition
} = await createPonyfill({
  region: 'westus',
  subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
});

const recognition = new SpeechRecognition();

recognition.grammars = new SpeechGrammarList();
recognition.grammars.words = ['Tuen Mun', 'Yuen Long'];

recognition.onresult = ({ results }) => {
  console.log(results);
};

recognition.start();
```

> Note: you can also pass `grammars` to `react-dictate-button` via `extra` props.

## Speech synthesis (text-to-speech)

```jsx
import { createSpeechSynthesisPonyfill } from 'web-speech-cognitive-services/lib/SpeechServices/TextToSpeech';

const {
  speechSynthesis,
  SpeechSynthesisUtterance
} = await createSpeechSynthesisPonyfill({
  region: 'westus',
  subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
});

const utterance = new SpeechSynthesisUtterance('Hello, World!');

await speechSynthesis.speak(utterance);
```

> Note: `speechSynthesis` is camel-casing because it is an instance.

> List of supported regions can be found in [this article](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-apis#text-to-speech-api).

`pitch`, `rate`, `voice`, and `volume` are supported. Only `onstart`, `onerror`, and `onend` events are supported.

### Integrating with React

You can use [`react-say`](https://github.com/compulim/react-say/) to integrate speech synthesis functionality to your React app.

```jsx
import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';
import React from 'react';
import Say from 'react-say';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  async componentDidMount() {
    const ponyfill = await createPonyfill({
      region: 'westus',
      subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
    });

    this.setState(() => ({ ponyfill }));
  }

  render() {
    const {
      state: { ponyfill }
    } = this;

    return (
      ponyfill &&
        <Say
          speechSynthesis={ ponyfill.speechSynthesis }
          speechSynthesisUtterance={ ponyfill.SpeechSynthesisUtterance }
          text="Hello, World!"
        />
    );
  }
}
```

## Lexical and ITN support

[Lexical and ITN support](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-apis#response-parameters) is unique in Cognitive Services Speech Services. Our adapter added additional properties `transcriptITN`, `transcriptLexical`, and `transcriptMaskedITN` to surface the result, in addition to `transcript` and `confidence`.

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
   * [x] Add tests for lifecycle events
   * [x] Support `stop()` and `abort()` function
   * [ ] Add grammar list
   * [ ] Investigate continuous mode
   * [ ] Investigate support of Opus (OGG) encoding
      * Currently, there is a problem with `microsoft-speech-browser-sdk@0.0.12`, tracking on [this issue](https://github.com/Azure-Samples/SpeechToText-WebSockets-Javascript/issues/88)
   * [ ] Support custom speech
   * [ ] Support ITN, masked ITN, and lexical output
* Speech synthesis
   * [ ] Event: add `pause`/`resume` support
   * [ ] Properties: add `paused`/`pending`/`speaking` support
   * [ ] Support [custom voice fonts](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-apis#text-to-speech-api)

# Contributions

Like us? [Star](https://github.com/compulim/web-speech-cognitive-services/stargazers) us.

Want to make it better? [File](https://github.com/compulim/web-speech-cognitive-services/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/web-speech-cognitive-services/pulls) a pull request.
