# Behaviors

Interactive mode means `continuous` is set to `false`. In Cognitive Services Speech Services SDK, this translate to `recognizeOnceAsync`.

Continuous mode means `continuous` is set to `true`, which is `startContinuousRecognitionAsync` in Cognitive Services Speech SDK.

## Happy path

- Interactive mode
   - W3C Web Speech API
      1. `start`
      1. `audiostart`
      1. `soundstart`
      1. `speechstart`
      1. Zero or more `results`
      1. `speechend`
      1. `soundend`
      1. `audioend`
      1. `result`
         - `results === [{ isFinal = true }]`
      1. `end`
   - Cognitive Services Speech Services
      - Call `recognizeOnceAsync()`
      - ❗ No `start` event
      - Receive one or more `recognizing` event with notable text in `result.text`
      - Silent for 15 seconds
      - ❗ No `recognized` or `stop` event is received
      - ❗ Microphone kept recording even after silence
      - Call `stopContinuousRecognitionAsync()`
         - ❗ `recognizeOnceAsync` should not react to `stopContinuousRecognitionAsync`, but it do
         - ❗ Microphone stop recording
      - Receive `stop` event
- Continuous mode
   - W3C Web Speech API
      1. `start`
      1. `audiostart`
      1. `soundstart`
      1. `speechstart`
      1. One or more `results`
         - `results === [{ isFinal: true }, { isFinal: true }]`
         - All with `isFinal === true`
      1. (When `stop()` is called)
      1. `speechend`
      1. `soundend`
      1. `audioend`
      1. `end`
   - Cognitive Services Speech Services
      1. Call `startContinuousRecognitionAsync()`
      1. Receive `start` event
      1. Receive multiple `recognizing` event
         - ❗ When speaking slowly with significant delay between sentences, the SDK is only able to recognize first sentence
      1. Call `stopContinuousRecognitionAsync()`
         - Observed microphone stop recording
      1. Receive `stop` event

## Abort

There is no `abort()` function in Cognitive Services Speech Services SDK.

### Abort before first recognition is made

- Interactive mode
   - W3C Web Speech API
      - TBD
- Continuous mode
   - W3C Web Speech API
      - TBD

### Abort after some speech is recognized

- Interactive mode
   - W3C Web Speech API
      1. `start`
      1. `audiostart`
      1. `soundstart`
      1. `speechstart`
      1. One or more `result`
      1. `speechend`
      1. `soundend`
      1. `audioend`
      1. `error`
         - `error === 'aborted'`
      1. `end`
- Continuous mode
   - W3C Web Speech API
      - TBD

## Network issues

Turn on airplane mode.

- Interactive mode
   - W3C Web Speech API
      1. `start`
      1. `audiostart`
      1. `audioend`
      1. `error`
         - `error === 'network'`
      1. `end`
   - Cognitive Services Speech Services
      - TBD
- Continuous mode
   - W3C Web Speech API
      - TBD
   - Cognitive Services Speech Services
      - TBD

## Microphone muted

- Interactive mode
   - W3C Web Speech API
      1. `start`
      1. `audiostart`
      1. `audioend`
      1. `error`
         - `error === 'no-speech'`
      1. `end`
   - Cognitive Services Speech Services
      1. ❗ No `start` event received
      1. After 5 seconds of silence, `recognized`
         - `json.RecognitionStatus === 'InitialSilenceTimeout'`
         - `offset === 50000000`
         - Microphone is off after this event
      1. `start`
         - ❗ `start` event is received immediately after `recognized`
      1. (When `stopContinuousRecognitionAsync()`)
      1. `stop`
- Continuous mode
   - W3C Web Speech API
      1. `start`
      1. `audiostart`
      1. `audioend`
      1. `error`
         - `error === 'no-speech'`
         - Even in continuous mode, browser will timeout with `no-speech` after 5 seconds
      1. `end`
   - Cognitive Services Speech Services
      1. `start`
      1. After 15 seconds of silence, `recognized`
         - `json.RecognitionStatus === 'InitialSilenceTimeout'`
         - `offset === 150000000`
      1. (When `stop()`), `stop`

## No speech is recognized

Some sounds are heard, but they cannot be recognized as text. There could be some interim results with recognized text, but the confidence is so low it dropped out of final result.

### Unrecognizable sound

- Interactive mode
   - W3C Web Speech API
      1. `start`
      1. `audiostart`
      1. `soundstart`
      1. `speechstart`
      1. `speechend`
      1. `soundend`
      1. `audioend`
      1. `end`
   - Cognitive Services Speech Services
      1. `start`
      1. After 5 seconds of unrecognizable sound, `recognized`
         - `json.RecognitionStatus === 'InitialSilenceTimeout'`
         - `offset === 50000000`
      1. (When `stop()`)
      1. `stop`
- Continuous mode
   - W3C Web Speech API
      1. `start`
      1. `audiostart`
      1. `soundstart`
      1. `speechstart`
      1. (When `stop()`)
      1. `speechend`
      1. `soundend`
      1. `audioend`
      1. `end`
   - Cognitive Services Speech Services
      1. `start`
      1. After 15 seconds of unrecognizable sound, `recognized`
         - `json.RecognitionStatus === 'InitialSilenceTimeout'`
         - `offset === 150000000`
      1. (When `stop()`)
      1. `stop`

## Not authorized to use microphone

- Interactive mode
   - W3C Web Speech API
      1. `error`
         - `error === 'not-allowed'`
      1. `end`
   - Cognitive Services Speech Services
      - TBD
- Continuous mode
   - W3C Web Speech API
      - TBD
   - Cognitive Services Speech Services
      - TBD
