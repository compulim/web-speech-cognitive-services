type SerializeRecognitionResultInit = {
  duration: number;
  errorDetails: string;
  json: string;
  offset: number;
  properties: unknown;
  reason: number;
  resultId: string;
  text: string;
};

type SerializedRecognitionResult = Readonly<{
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
}: SerializeRecognitionResultInit): SerializedRecognitionResult {
  return Object.freeze({
    duration,
    errorDetails,
    json: JSON.parse(json),
    offset,
    properties,
    reason,
    resultId,
    text
  });
}
