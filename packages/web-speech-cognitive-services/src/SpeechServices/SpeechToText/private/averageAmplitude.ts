export default function averageAmplitude(arrayBuffer: ArrayBuffer): number {
  const array = Array.from(new Int16Array(arrayBuffer));

  return array.reduce((averageAmplitude, amplitude) => averageAmplitude + Math.abs(amplitude), 0) / array.length;
}
