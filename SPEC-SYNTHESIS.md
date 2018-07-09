# Speech synthesis

Quick grab:
* Web Speech API
   * Firefox on Android does not support `window.speechSynthesis`
* Cognitive Services Text-to-Speech
   * Supported on all popular platforms

| Platform             | OS                        | Browser             | Cognitive Services (Web Audio) | Web Speech API                              |
| -                    | -                         | -                   | -                           | -                                           |
| PC                   | Windows 10 (1803)         | Chrome 67.0.3396.99 | Yes                         | Yes                                         |
| PC                   | Windows 10 (1803)         | Edge 42.17134.1.0   | Yes                         | Yes                                         |
| PC                   | Windows 10 (1803)         | Firefox 61.0        | Yes                         | Yes                                         |
| MacBook Pro          | macOS High Sierra 10.13.1 | Chrome 67.0.3396.99 | ?                           | ?                                           |
| MacBook Pro          | macOS High Sierra 10.13.1 | Safari 11.0.1       | ?                           | ?                                           |
| Apple iPhone X       | iOS 11.4                  | Chrome 67.0.3396.87 | ?                           | ?                                           |
| Apple iPhone X       | iOS 11.4                  | Edge 42.2.2.0       | ?                           | ?                                           |
| Apple iPhone X       | iOS 11.4                  | Safari              | ?                           | ?                                           |
| Apple iPod (6th gen) | iOS 11.4                  | Chrome 67.0.3396.87 | Yes                         | Yes                                         |
| Apple iPod (6th gen) | iOS 11.4                  | Edge 42.2.2.0       | Yes                         | Yes                                         |
| Apple iPod (6th gen) | iOS 11.4                  | Safari              | Yes                         | Yes                                         |
| Google Pixel 2       | Android 8.1.0             | Chrome 67.0.3396.87 | Yes                         | Yes                                         |
| Google Pixel 2       | Android 8.1.0             | Edge 42.0.0.2057    | No, got 'EncodingError: Unable to decode audio data'                | Yes |
| Google Pixel 2       | Android 8.1.0             | Firefox 60.1.0      | Yes                         | No, `window.speechSynthesis` is `undefined` |
| Microsoft Lumia 950  | Windows 10 (1709)         | Edge 40.15254.489.0 | Yes                         | Yes                                         |
| Microsoft Xbox One   | Windows 10 (1806) 17134.4054 | Edge 42.17134.4054.0 | Yes | Yes |
