import { type SpeechRecognitionResult } from 'microsoft-cognitiveservices-speech-sdk';

export type SerializedRecognitionResult = Readonly<{
  duration: number;
  errorDetails: string;
  json: unknown;
  offset: number;
  properties: unknown;
  reason: number;
  resultId: string;
  text: string;
}>;

export default function serializeRecognitionResult({
  duration,
  errorDetails,
  json,
  offset,
  properties,
  reason,
  resultId,
  text
}: SpeechRecognitionResult): SerializedRecognitionResult {
  return Object.freeze({
    duration,
    errorDetails,
    json: json && JSON.parse(json),
    offset,
    properties,
    reason,
    resultId,
    text
  });
}
