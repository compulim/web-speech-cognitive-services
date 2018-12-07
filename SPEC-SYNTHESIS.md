# Speech synthesis

Browsers are all latest as of 2018-07-13.

Quick grab:

* Supported on all popular platforms
* At least one solution works on every browser of every platform

| Platform             | OS                           | Browser              | Cognitive Services (Web Audio)                       | Web Speech API                              |
| -                    | -                            | -                    | -                                                    | -                                           |
| PC                   | Windows 10 (1803)            | Chrome 67.0.3396.99  | Yes                                                  | Yes                                         |
| PC                   | Windows 10 (1803)            | Edge 42.17134.1.0    | Yes                                                  | Yes                                         |
| PC                   | Windows 10 (1803)            | Firefox 61.0         | Yes                                                  | Yes                                         |
| MacBook Pro          | macOS High Sierra 10.13.1    | Chrome 67.0.3396.99  | Yes                                                  | Yes                                         |
| MacBook Pro          | macOS High Sierra 10.13.1    | Safari 11.0.1        | Yes                                                  | Yes                                         |
| Apple iPod mini 4    | iOS 11.4.1                   | Chrome 67.0.3396.87  | Yes                                                  | Yes                                         |
| Apple iPod mini 4    | iOS 11.4.1                   | Edge 42.2.2.0        | Yes                                                  | Yes                                         |
| Apple iPod mini 4    | iOS 11.4.1                   | Safari               | Yes                                                  | Yes                                         |
| Apple iPod (6th gen) | iOS 11.4                     | Chrome 67.0.3396.87  | Yes                                                  | Yes                                         |
| Apple iPod (6th gen) | iOS 11.4                     | Edge 42.2.2.0        | Yes                                                  | Yes                                         |
| Apple iPod (6th gen) | iOS 11.4                     | Safari               | Yes                                                  | Yes                                         |
| Google Pixel 2       | Android 8.1.0                | Chrome 67.0.3396.87  | Yes                                                  | Yes                                         |
| Google Pixel 2       | Android 8.1.0                | Edge 42.0.0.2057     | No, got 'EncodingError: Unable to decode audio data' | Yes                                         |
| Google Pixel 2       | Android 8.1.0                | Firefox 60.1.0       | Yes                                                  | No, `window.speechSynthesis` is `undefined` |
| Microsoft Lumia 950  | Windows 10 (1709)            | Edge 40.15254.489.0  | Yes                                                  | Yes                                         |
| Microsoft Xbox One   | Windows 10 (1806) 17134.4054 | Edge 42.17134.4054.0 | Yes                                                  | Yes                                         |

# Behaviors

We tested the following behaviors:

- Happy path with multiple pending
- Pause/resume
- Pause/cancel with multiple pending

> For comparison, we use Chrome and Edge on Windows. Chrome support both OS-provided speech and Google Cloud Speech services. The behavior between 2 providers on Chrome is different.

## Happy path with multiple pending

- Speak 2 utterances
- Expect: receive `start` event from the first utterance
- Expect: `speaking` property is set to `true`
- Wait until the first utterance has finished
- Expect: receive `end` event from the first utterance
- Expect: receive `start` event from the second utterance
- Wait until the second utterance has finished
- Expect: receive `end` event from the second utterance
- Expect: `speaking` property is set to `false`

> Quirks: `boundary` events are not fired because Speech Services does not provide the information.
> Quirks: Chrome using Google Cloud Speech will not fire `boundary` event.

## Pause/resume

- Speak an utterance
- Expect: receive `start` event from the utterance
- Expect: `speaking` property is set to `true`
- Call `speechSynthesis.pause()`
- Expect: receive `pause` event from the utterance
- Expect: `speaking` property is continue to be `true`
- Call `speechSynthesis.resume()`
- Expect: receive `resume` event from the utterance
- Wait until the utterance has finished
- Expect: receive `end` event from the utterance
- Expect: `speaking` property is set to `false`

> Quirks: Speech Services pause as soon as `pause()` is called. For OS-provided browser speech, `pause()` will pause at word boundary.
> Quirks: Chrome using Google Cloud Speech will pause immediately and does not pause at word boundary.

## Pause/cancel with multiple pending

- Speak 2 utterances
- During the first utterance, call `speechSynthesis.pause()`
- Expect: receive `pause` event from the first utterance
- Call `speechSynthesis.cancel()`
- Expect: receive `end` event from the first utterance
- Expect: no events from the second utterance, no `start` or `end` events
- Expect: `speaking` property is set to `false`
- Call `speechSynthesis.resume()`
- Expect: no additional events from both of the utterances
- Expect: `speaking` property is continue to be `false`
