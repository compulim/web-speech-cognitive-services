# Behaviors

Interactive mode means `continuous` is set to `false`. In Cognitive Services Speech Services SDK, this translate to `recognizeOnceAsync`.

Continuous mode means `continuous` is set to `true`, which is `startContinuousRecognitionAsync` in Cognitive Services Speech SDK.

## Happy path

- Interactive mode (with interim results)
   - W3C Web Speech API
      1. `start`
      1. `audiostart`
      1. `soundstart`
      1. `speechstart`
      1. One or more `result` events, if `interimResults` is set to `true`
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
      1. One or more `results`, if `interimResults` is set to `true`
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

## Stop

`stop()` is a supported feature in Web Speech API for push-to-talk operation.

❗ Cognitive Services does not support push-to-talk natively, we are trying to mimic the behavior by hiding the output after `stop()` is called.

- We are taking the latest interim results as the final results
   - Lexical ("one two three") does not get converted into ITN ("123") for interim results
   - Cognitive Services does not return confidence for interims, thus, we will assume it is `0.5`
- Microphone will not stop recording immediately

### Stop before first recognition is made

- Interactive mode (with interim results)
   - W3C Web Speech API
      1. `start`
      1. `audiostart`
      1. Optional, `soundstart`
      1. Optional, `speechstart`
      1. Optional, `speechend`
      1. Optional, `soundend`
      1. `audioend`
      1. `end`
   - Cognitive Services
      - `recognizeOnceAsync` does not support stop or cancellation, thus, we need to mimic the behavior by ignoring some `recognizing` and the final `recognized` event
      1. Call `recognizeOnceAsync()`
      1. (`stop()` is called)
      1. Receive a final `recognized` event
      1. `onSuccess(result)` callback from `recognizeOnceAsync()`
- Continuous mode
   - W3C Web Speech API
      - TBD
   - Cognitive Services
      - TBD

### Stop after some recognition is made

- Interactive mode (with interim results)
   - W3C Web Speech API
      1. `start`
      1. `audiostart`
      1. `soundstart`
      1. `speechstart`
      1. One or more `result`
      1. `speechend`
      1. `soundend`
      1. `audioend`
      1. ❓ One or more `result` with `results === [{ isFinal: false }]`
      1. `result`
         - `results === [{ isFinal: true }]`
      1. `end`
   - Cognitive Services
      - `recognizeOnceAsync` does not support stop or cancellation, thus, we need to mimic the behavior by ignoring some `recognizing` and the final `recognized` event
      1. Call `recognizeOnceAsync()`
      1. Receive zero or more `recognizing` event
         - With notable text in `result.text`
         - `result.json` is similar to `{"Text":"text","Offset":200000,"Duration":32400000}`
      1. Receive a final `recognized` event
         - `result.json` is similar to `{"RecognitionStatus":"Success","Offset":1800000,"Duration":48100000,"NBest":[{"Confidence":0.2331869,"Lexical":"no","ITN":"no","MaskedITN":"no","Display":"No."}]}`
      1. `onSuccess(result)` callback from `recognizeOnceAsync()`
- Continuous mode
   - W3C Web Speech API
      - TBD
   - Cognitive Services
      - TBD

## Abort

### Abort before first recognition is made

- Interactive mode (with interim results)
   - W3C Web Speech API
      1. `start`
      1. `audiostart`
      1. `audioend`
      1. `error`
         - `error === 'aborted'`
      1. `end`
   - Cognitive Services
      - There is no `abort()` equivalent for `recognizeOnceAsync()`, thus, microphone will not stop recording immediately
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

### Airplane mode

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
      1. Received `canceled` event
         - `errorDetails === 'Unable to contact server. StatusCode: 1006, Reason: '`
      1. `error` callback is received
         - `errorDetails === 'Unable to contact server. StatusCode: 1006, Reason: '`
      - (Microphone was not turned on, or too short to detect if it has turned on)
- Continuous mode
   - W3C Web Speech API
      - TBD
   - Cognitive Services Speech Services
      - TBD

### Invalid subscription key

Since browser speech does not requires subscription key, we assume this flow should be same as airplane mode.

- Interactive mode
   - W3C Web Speech API
      1. `start`
      1. `audiostart`
      1. `audioend`
      1. `error`
         - `error === 'network'`
      1. `end`
   - Cognitive Services Speech Services
      1. Console (on Chrome) logged `WebSocket connection to 'wss://westus.stt.speech.microsoft.com/speech/recognition/interactive/cognitiveservices/v1?language=en-US&format=detailed&Ocp-Apim-Subscription-Key=...&X-ConnectionId=...' failed: HTTP Authentication failed; no valid credentials available`.
      1. Received `canceled` event
         - `errorDetails === 'Unable to contact server. StatusCode: 1006, Reason: '`
         - `reason === 0`
      1. `error` callback is received
         - `errorDetails === 'Unable to contact server. StatusCode: 1006, Reason: '`
      - (Microphone was not turned on, or too short to detect if it has turned on)
- Continuous mode
   - W3C Web Speech API
      - TBD
   - Cognitive Services Speech Services
      - TBD

## No speech is recognized

### Microphone muted

Microphone is muted and record level is at zero. This should be distinguishable by missing of `soundstart` event on Web Speech API.

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

### Unrecognizable sound

Some sounds are heard, but they cannot be recognized as text. There could be some interim results with recognized text, but the confidence is so low it dropped out of final result.

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
      1. TBD
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
      1. (No `start` event was received)
      1. `error`
         - `error === 'not-allowed'`
      1. `end`
   - Cognitive Services Speech Services
      1. `recognizeOnceAsync(success, error)` returned with `error` callback
         - `"Runtime error: 'Error handler for error Error occurred during microphone initialization: NotAllowedError: Permission denied threw error Error: Error occurred during microphone initialization: NotAllowedError: Permission denied'"`
- Continuous mode
   - W3C Web Speech API
      1. `error`
         - `error === 'not-allowed'`
      1. `end`
   - Cognitive Services Speech Services
      - TBD
