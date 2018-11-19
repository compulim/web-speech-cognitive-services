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
      1. Zero or more `result` events
      1. `speechend`
      1. `soundend`
      1. `audioend`
      1. `result`
         - `results === [{ isFinal: true }]`
      1. `end`
   - Cognitive Services Speech Services
      1. Call `recognizeOnceAsync()`
      1. Receive zero or more `recognizing` event
         - With notable text in `result.text`
         - `result.json` is similar to `{"Text":"text","Offset":200000,"Duration":32400000}`
      1. Receive a final `recognized` event
         - `result.json` is similar to `{"RecognitionStatus":"Success","Offset":1800000,"Duration":48100000,"NBest":[{"Confidence":0.2331869,"Lexical":"no","ITN":"no","MaskedITN":"no","Display":"No."}]}`
      1. `onSuccess(result)` callback from `recognizeOnceAsync()`
         - `result` is similar to or same as the `event.result` object received from `recognized(event)`
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
      - TBD
      1. ~~Call `startContinuousRecognitionAsync()`~~
      1. ~~Receive `start` event~~
      1. ~~Receive multiple `recognizing` event~~
         - ~~❗ When speaking slowly with significant delay between sentences, the SDK is only able to recognize first sentence~~
      1. ~~Call `stopContinuousRecognitionAsync()`~~
         - ~~Observed microphone stop recording~~
      1. ~~Receive `stop` event~~

## Abort

On Cognitive Services, there is no `abort()` function, thus, we are using `stop()` function for the study.

### Abort before first recognition is made

- Interactive mode
   - W3C Web Speech API
      - TBD
   - Cognitive Services
      - TBD
- Continuous mode
   - W3C Web Speech API
      - TBD
   - Cognitive Services
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
   - Cognitive Services
      - TBD
- Continuous mode
   - W3C Web Speech API
      - TBD
   - Cognitive Services
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
      1. (TODO: Check if microphone is turned on)
      1. Received `canceled` event
         - `errorDetails === 'Unable to contact server. StatusCode: 1006, Reason: '`
      1. `error` callback is received
         - `errorDetails === 'Unable to contact server. StatusCode: 1006, Reason: '`
      1. Microphone is turned off
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
      1. After 5 seconds of silence, `recognized`
         - `result.json.RecognitionStatus === 'InitialSilenceTimeout'`
         - `result.offset === 50000000`
         - Microphone is off after this event
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
      1. ~~`start`~~
      1. ~~After 15 seconds of silence, `recognized`~~
         - ~~`json.RecognitionStatus === 'InitialSilenceTimeout'`~~
         - ~~`offset === 150000000`~~
      1. ~~(When `stop()`), `stop`~~

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
      1. (TBD)
      1. ~~After 5 seconds of unrecognizable sound, `recognized`~~
         - ~~`json.RecognitionStatus === 'InitialSilenceTimeout'`~~
         - ~~`offset === 50000000`~~
         - ~~Microphone is off after this event~~
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
      1. ~~`start`~~
      1. ~~After 15 seconds of unrecognizable sound, `recognized`~~
         - ~~`json.RecognitionStatus === 'InitialSilenceTimeout'`~~
         - ~~`offset === 150000000`~~
      1. ~~(When `stop()`)~~
      1. ~~`stop`~~

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
