# web-speech-cognitive-services

Web Speech API adapter to use Cognitive Services Speech Services for both speech-to-text and text-to-speech service.

[![npm version](https://badge.fury.io/js/web-speech-cognitive-services.svg)](https://badge.fury.io/js/web-speech-cognitive-services) [![Build Status](https://travis-ci.org/compulim/web-speech-cognitive-services.svg?branch=master)](https://travis-ci.org/compulim/web-speech-cognitive-services)

# Description

Speech technologies enables a lot of interesting scenarios, including Intelligent Personal Assistant and provide alternative inputs for assistive technologies.

Although W3C standardized speech technologies in browser, speech-to-text and text-to-speech support are still scarce. However, cloud-based speech technologies are very mature.

This polyfill provides W3C [Speech Recognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) and [Speech Synthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) API in browser by using [Azure Cognitive Services Speech Services](https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/). This will bring speech technologies to all modern first-party browsers available on both PC and mobile platforms.

# Demo

> Before getting started, please obtain a Cognitive Services subscription key from your Azure subscription.

Try out our demo at https://compulim.github.io/web-speech-cognitive-services. If you don't have a subscription key, you can still try out our demo in a speech-supported browser.

We use [`react-dictate-button`](https://github.com/compulim/react-dictate-button/) and [`react-say`](https://github.com/compulim/react-say/) to quickly setup the playground.

## Browser requirements

Speech recognition requires WebRTC API and the page must hosted thru HTTPS or `localhost`. Although iOS 12 support WebRTC, native apps using `WKWebView` do not support WebRTC.

### Special requirement for Safari

Speech synthesis requires Web Audio API. For Safari, user gesture (click or tap) is required to play audio clips using Web Audio API. To ready the Web Audio API to use without user gesture, you can synthesize an empty string, which will not trigger any network calls but playing an empty hardcoded short audio clip. If you already have a "primed" `AudioContext` object, you can also pass it as an option.

# How to use

There are two ways to use this package:

1. [Using `<script>` to load the bundle](#using-script-to-load-the-bundle)
1. [Install from NPM](#install-from-npm)

## Using `<script>` to load the bundle

To use the ponyfill directly in HTML, you can use our published bundle from unpkg.

In the sample below, we use the bundle to perform text-to-speech with a voice named "Aria24kRUS".

```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <script src="https://unpkg.com/web-speech-cognitive-services/umd/web-speech-cognitive-services.production.min.js"></script>
  </head>
  <body>
    <script>
      const { speechSynthesis, SpeechSynthesisUtterance } = window.WebSpeechCognitiveServices.create({
        credentials: {
          region: 'westus',
          subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
        }
      });

      speechSynthesis.addEventListener('voiceschanged', () => {
        const voices = speechSynthesis.getVoices();
        const utterance = new SpeechSynthesisUtterance('Hello, World!');

        utterance.voice = voices.find(voice => /Aria24kRUS/u.test(voice.name));

        speechSynthesis.speak(utterance);
      });
    </script>
  </body>
</html>
```

> We do not host the bundle. You should always use [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) to protect bundle integrity when loading from a third-party CDN.

The `voiceschanged` event come shortly after you created the ponyfill. You will need to wait until the event arrived before able to choose a voice for your utterance.

## Install from NPM

For production build, run `npm install web-speech-cognitive-services`.

For development build, run `npm install web-speech-cognitive-services@master`.

> Since [Speech Services SDK](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/quickstart-js-browser) is not on NPM yet, we will bundle the SDK inside this package for now. When Speech Services SDK release on NPM, we will define it as a peer dependency.

## Polyfilling vs. ponyfilling

In JavaScript, polyfill is a technique to bring newer features to older environment. Ponyfill is very similar, but instead polluting the environment by default, we prefer to let the developer to choose what they want. This [article](https://ponyfoo.com/articles/polyfills-or-ponyfills) talks about polyfill vs. ponyfill.

In this package, we prefer ponyfill because it do not pollute the hosting environment. You are also free to mix-and-match multiple speech recognition engines under a single environment.

## Options

The following list all options supported by the adapter.

<table>
  <thead>
    <tr>
      <th>Name and type</th>
      <th>Default value</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>audioConfig:&nbsp;<a href="https://docs.microsoft.com/en-us/javascript/api/microsoft-cognitiveservices-speech-sdk/audioconfig?view=azure-node-latest">AudioConfig</a></code></td>
      <td><code><a href="https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/how-to-select-audio-input-devices#audio-device-ids-in-javascript">fromDefaultMicrophoneInput()</a></code></td>
      <td>
        <a href="https://docs.microsoft.com/en-us/javascript/api/microsoft-cognitiveservices-speech-sdk/audioconfig?view=azure-node-latest"><code>AudioConfig</code></a> object to use with speech recognition. Please refer to <a href="https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/how-to-select-audio-input-devices#audio-device-ids-in-javascript">this article</a> for details on selecting different audio devices.
      </td>
    </tr>
    <tr>
      <td>
        <code>audioContext:&nbsp;<a href="https://developer.mozilla.org/en-US/docs/Web/API/AudioContext">AudioContext</a></code>
      </td>
      <td><code>undefined</code></td>
      <td>
        The audio context is synthesizing speech on. If this is <code>undefined</code>, the <code>AudioContext</code> object will be created on first synthesis.
      </td>
    </tr>
    <tr>
      <td>
        <code>credentials:&nbsp;(</code><br />
        <code>&nbsp;&nbsp;ICredentials&nbsp;||</code><br />
        <code>&nbsp;&nbsp;Promise&lt;ICredentials&gt;&nbsp;||</code><br />
        <code>&nbsp;&nbsp;()&nbsp;=>&nbsp;ICredentials&nbsp;||</code><br />
        <code>&nbsp;&nbsp;()&nbsp;=>&nbsp;Promise&lt;ICredentials&gt;</code><br />
        <code>)</code><br />
        <br />
        <code>ICredentials: {</code><br />
        <code>&nbsp;&nbsp;authorizationToken: string,</code><br />
        <code>&nbsp;&nbsp;region: string</code><br />
        <code>} || {</code><br />
        <code>&nbsp;&nbsp;region: string,</code><br />
        <code>&nbsp;&nbsp;subscriptionKey: string</code><br />
        <code>} || {</code><br />
        <code>&nbsp;&nbsp;authorizationToken: string,</code><br />
        <code>&nbsp;&nbsp;customVoiceHostname?: string,</code><br />
        <code>&nbsp;&nbsp;speechRecognitionHostname: string,</code><br />
        <code>&nbsp;&nbsp;speechSynthesisHostname: string</code><br />
        <code>} || {</code><br />
        <code>&nbsp;&nbsp;customVoiceHostname?: string,</code><br />
        <code>&nbsp;&nbsp;speechRecognitionHostname: string,</code><br />
        <code>&nbsp;&nbsp;speechSynthesisHostname: string,</code><br />
        <code>&nbsp;&nbsp;subscriptionKey: string</code><br />
        <code>}</code>
      </td>
      <td>(Required)</td>
      <td>
        Credentials (including Azure region) from Cognitive Services. Please refer to <a href="https://docs.microsoft.com/en-us/azure/cognitive-services/authentication">this article</a> to obtain an authorization token.<br />
        <br />
        Subscription key is not recommended for production use as it will be leaked in the browser.<br />
        <br />
        For sovereign cloud such as Azure Government (United States) and Azure China, instead of specifying <code>region</code>, please specify <code>speechRecongitionHost</code> and <code>speechSynthesisHostname</code> instead. You can find the <a href="https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/sovereign-clouds">sovereign cloud connection parameters from this article</a>.
      </td>
    </tr>
    <tr>
      <td><code>enableTelemetry</code></td>
      <td><code>undefined</code></td>
      <td>
        Pass-through option to enable or disable telemetry for Speech SDK recognizer as <a href="https://github.com/Microsoft/cognitive-services-speech-sdk-js#data--telemetry">outlined in Speech SDK</a>. This adapter does not collect any telemetry.<br /><br />By default, Speech SDK will collect telemetry unless this is set to <code>false</code>.
      </td>
    </tr>
    <tr>
      <td><code>looseEvents: boolean</code></td>
      <td><code>false</code></td>
      <td>
        Specifies if the event order should strictly follow observed browser behavior (<code>false</code>), or loosened behavior (<code>true</code>). Regardless of the option, both behaviors <a href="https://wicg.github.io/speech-api/#eventdef-speechrecognition-result">conform with W3C specifications</a>.
        <br /><br />
        You can read more about this option in <a href="#event-order">event order section</a>.
      </td>
    </tr>
    <tr>
      <td><code>ponyfill.AudioContext:&nbsp;<a href="https://developer.mozilla.org/en-US/docs/Web/API/AudioContext">AudioContext</a></code></td>
      <td><code>window.AudioContext&nbsp;||</code><br /><code>window.webkitAudioContext</code></td>
      <td>
        Ponyfill for Web Audio API.<br /><br />
        Currently, only Web Audio API can be ponyfilled. We may expand to WebRTC for audio recording in the future.</td>
      </td>
    </tr>
    <tr>
      <td><code>referenceGrammars:&nbsp;string[]</code></td>
      <td><code>undefined</code></td>
      <td>
        Reference grammar IDs to send for speech recognition.
      </td>
    </tr>
    <tr>
      <td><code>speechRecognitionEndpointId:&nbsp;string</code></td>
      <td><code>undefined</code></td>
      <td>
        Endpoint ID for <a href="https://azure.microsoft.com/en-us/services/cognitive-services/custom-speech-service/">Custom Speech service</a>.
      </td>
    <tr>
      <td><code>speechSynthesisDeploymentId:&nbsp;string</code></td>
      <td><code>undefined</code></td>
      <td>
        Deployment ID for <a href="https://speech.microsoft.com/customvoice">Custom Voice service</a>.<br /><br />
        When you are using Custom Voice, you will need to specify your voice model name through <a href="https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice"><code>SpeechSynthesisVoice.voiceURI</code></a>. Please refer to the <a href="#custom-voice-support">"Custom Voice support"</a> section for details.
      </td>
    </tr>
    <tr>
      <td><code>speechSynthesisOutputFormat:&nbsp;string</code></td>
      <td><code>"audio-24khz-160kbitrate-mono-mp3"</code></td>
      <td>Audio format for speech synthesis. Please refer to <a href="https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-text-to-speech#audio-outputs">this article</a> for list of supported formats.</td>
    </tr>
    <tr>
      <td><code>textNormalization:&nbsp;string</code></td>
      <td><code>"display"</code></td>
      <td>
        Supported text normalization options:<br /><br />
        <ul>
          <li><code>"display"</code></li>
          <li><code>"itn"</code> (inverse text normalization)</li>
          <li><code>"lexical"</code></li>
          <li><code>"maskeditn"</code> (masked ITN)</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

## Setting up for sovereign clouds

You can use the adapter to connect to sovereign clouds, including [Azure Government (United States)](#azure-government-united-states) and [Microsoft Azure China](#microsoft-azure-china).

Please refer to [this article on limitations](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/sovereign-clouds) when using Cognitive Services Speech Services on sovereign clouds.

### Azure Government (United States)

```js
createPonyfill({
  credentials: {
    authorizationToken: 'YOUR_AUTHORIZATION_TOKEN',
    speechRecognitionHostname: 'virginia.stt.speech.azure.us',
    speechSynthesisHostname: 'virginia.tts.speech.azure.us'
  }
});
```

### Microsoft Azure China

```js
createPonyfill({
  credentials: {
    authorizationToken: 'YOUR_AUTHORIZATION_TOKEN',
    speechRecognitionHostname: 'chinaeast2.stt.speech.azure.cn',
    speechSynthesisHostname: 'chinaeast2.tts.speech.azure.cn'
  }
});
```

# Code snippets

> For readability, we omitted the async function in all code snippets. To run the code, you will need to wrap the code using an async function.

## Speech recognition (speech-to-text)

```jsx
import { createSpeechRecognitionPonyfill } from 'web-speech-cognitive-services/lib/SpeechServices/SpeechToText';

const {
  SpeechRecognition
} = await createSpeechRecognitionPonyfill({
  credentials: {
    region: 'westus',
    subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
  }
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
  credentials: {
    region: 'westus',
    subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
  }
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

## Speech synthesis (text-to-speech)

```jsx
import { createSpeechSynthesisPonyfill } from 'web-speech-cognitive-services/lib/SpeechServices/TextToSpeech';

const {
  speechSynthesis,
  SpeechSynthesisUtterance
} = await createSpeechSynthesisPonyfill({
  credentials: {
    region: 'westus',
    subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
  }
});

speechSynthesis.addEventListener('voiceschanged', () => {
  const voices = speechSynthesis.getVoices();
  const utterance = new SpeechSynthesisUtterance('Hello, World!');

  utterance.voice = voices.find(voice => /Aria24kRUS/u.test(voice.name));

  speechSynthesis.speak(utterance);
});
```

> Note: `speechSynthesis` is camel-casing because it is an instance.

> List of supported regions can be found in [this article](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-apis#text-to-speech-api).

`pitch`, `rate`, `voice`, and `volume` are supported. Only `onstart`, `onerror`, and `onend` events are supported.

### Integrating with React

You can use [`react-say`](https://github.com/compulim/react-say/) to integrate speech synthesis functionality to your React app.

```jsx
import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';
import React, { useEffect, useState } from 'react';
import Say from 'react-say';

export default () => {
  const [ponyfill, setPonyfill] = useState();

  useEffect(async () => {
    setPonyfill(await createPonyfill({
      credentials: {
        region: 'westus',
        subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
      }
    }));
  }, [setPonyfill]);

  return (
    ponyfill &&
      <Say
        speechSynthesis={ ponyfill.speechSynthesis }
        speechSynthesisUtterance={ ponyfill.SpeechSynthesisUtterance }
        text="Hello, World!"
      />
  );
};
```

## Using authorization token

Instead of exposing subscription key on the browser, we strongly recommend using authorization token.

```jsx
import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

const ponyfill = await createPonyfill({
  credentials: {
    authorizationToken: 'YOUR_AUTHORIZATION_TOKEN',
    region: 'westus'
  }
});
```

You can also provide an async function that will fetch the authorization token and Azure region on-demand. You should cache the authorization token for subsequent request. For simplicity of this code snippets, we are not caching the result.

```jsx
import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

const ponyfill = await createPonyfill({
  credentials: () => fetch('https://example.com/your-token').then(res => ({
    authorizationToken: res.text(),
    region: 'westus'
  }))
});
```

> List of supported regions can be found in [this article](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-apis#regions-and-endpoints).

## Lexical and ITN support

[Lexical and ITN support](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-apis#response-parameters) is unique in Cognitive Services Speech Services. Our adapter added additional properties `transcriptITN`, `transcriptLexical`, and `transcriptMaskedITN` to surface the result, in addition to `transcript` and `confidence`.

## Biasing towards some words for recognition

In some cases, you may want the speech recognition engine to be biased towards "Bellevue" because it is not trivial for the engine to recognize between "Bellevue", "Bellview" and "Bellvue" (without "e"). By giving a list of words, teh speech recognition engine will be more biased to your choice of words.

Since Cognitive Services does not works with weighted grammars, we built another `SpeechGrammarList` to better fit the scenario.

```jsx
import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

const {
  SpeechGrammarList,
  SpeechRecognition
} = await createPonyfill({
  credentials: {
    region: 'westus',
    subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
  }
});

const recognition = new SpeechRecognition();

recognition.grammars = new SpeechGrammarList();
recognition.grammars.phrases = ['Tuen Mun', 'Yuen Long'];

recognition.onresult = ({ results }) => {
  console.log(results);
};

recognition.start();
```

## Custom Speech support

> Please refer to ["What is Custom Speech?"](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/how-to-custom-speech) for tutorial on creating your first Custom Speech model.

To use custom speech for speech recognition, you need to pass the endpoint ID while creating the ponyfill.

```js
import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

const ponyfill = await createPonyfill({
  credentials: {
    region: 'westus',
    subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
  },
  speechRecognitionEndpointId: '12345678-1234-5678-abcd-12345678abcd',
});
```

## Custom Voice support

> Please refer to ["Get started with Custom Voice"](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/how-to-custom-voice) for tutorial on creating your first Custom Voice model.

To use Custom Voice for speech synthesis, you need to pass the deployment ID while creating the ponyfill, and pass the voice model name as voice URI.

```js
import createPonyfill from 'web-speech-cognitive-services/lib/SpeechServices';

const ponyfill = await createPonyfill({
  credentials: {
    region: 'westus',
    subscriptionKey: 'YOUR_SUBSCRIPTION_KEY'
  },
  speechSynthesisDeploymentId: '12345678-1234-5678-abcd-12345678abcd',
});

const { speechSynthesis, SpeechSynthesisUtterance } = ponyfill;

const utterance = new SpeechSynthesisUtterance('Hello, World!');

utterance.voice = { voiceURI: 'your-model-name' };

await speechSynthesis.speak(utterance);
```

## Event order

According to [W3C specifications](https://wicg.github.io/speech-api/#eventdef-speechrecognition-result), the `result` event can be fire at any time after `audiostart` event.

In continuous mode, finalized `result` event will be sent as early as possible. But in non-continuous mode, we observed browsers send finalized `result` event just before `audioend`, instead of as early as possible.

By default, we follow event order observed from browsers (a.k.a. strict event order). For a speech recognition in non-continuous mode and with interims, the observed event order will be:

1. `start`
1. `audiostart`
1. `soundstart`
1. `speechstart`
1. `result` (these are interim results, with `isFinal` property set to `false`)
1. `speechend`
1. `soundend`
1. `audioend`
1. `result` (with `isFinal` property set to `true`)
1. `end`

You can loosen event order by setting `looseEvents` to `true`. For the same scenario, the event order will become:

1. `start`
1. `audiostart`
1. `soundstart`
1. `speechstart`
1. `result` (these are interim results, with `isFinal` property set to `false`)
1. `result` (with `isFinal` property set to `true`)
1. `speechend`
1. `soundend`
1. `audioend`
1. `end`

For `error` events (abort, `"no-speech"` or other errors), we always sent it just before the last `end` event.

In some cases, loosening event order may improve recognition performance. This will not break conformance to W3C standard.

# Test matrix

For detailed test matrix, please refer to [`SPEC-RECOGNITION.md`](SPEC-RECOGNITION.md) or [`SPEC-SYNTHESIS.md`](SPEC-SYNTHESIS.md).

# Known issues

* Speech recognition
   * Interim results do not return confidence, final result do have confidence
      * We always return `0.5` for interim results
   * Cognitive Services support grammar list but not in JSGF format, more work to be done in this area
      * Although Google Chrome support grammar list, it seems the grammar list is not used at all
* Speech synthesis
   * `onboundary`, `onmark`, `onpause`, and `onresume` are not supported/fired
   * `pause` will pause immediately and do not pause on word breaks due to lack of boundary

# Roadmap

* Speech recognition
   * [x] Add tests for lifecycle events
   * [x] Support `stop()` and `abort()` function
   * [x] Add dynamic phrases
   * [x] Add reference grammars
   * [x] Add continuous mode
   * [ ] ~Investigate support of Opus (OGG) encoding~
      * Currently, there is a problem with `microsoft-speech-browser-sdk@0.0.12`, tracking on [this issue](https://github.com/Azure-Samples/SpeechToText-WebSockets-Javascript/issues/88)
   * [x] Support custom speech
   * [x] Support ITN, masked ITN, and lexical output
* Speech synthesis
   * [x] Event: add `pause`/`resume` support
   * [x] Properties: add `paused`/`pending`/`speaking` support
   * [x] Support [custom voice fonts](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-apis#text-to-speech-api)

# Contributions

Like us? [Star](https://github.com/compulim/web-speech-cognitive-services/stargazers) us.

Want to make it better? [File](https://github.com/compulim/web-speech-cognitive-services/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/web-speech-cognitive-services/pulls) a pull request.
