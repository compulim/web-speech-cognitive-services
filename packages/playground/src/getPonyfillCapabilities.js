export default function getPonyfillCapabilities(ponyfillType) {
  const bingSpeech = ponyfillType === 'bingspeech';
  const browser = ponyfillType === 'browser';
  const speechServices = /^speechservices:/u.test(ponyfillType);

  const bundle = browser || ponyfillType === 'speechservices:bundle';
  const npm = bingSpeech || ponyfillType === 'speechservices:npm';

  const customSpeech = speechServices;
  const customVoice = speechServices;
  const dynamicPhrases = bingSpeech || speechServices;
  const inverseTextNormalization = speechServices;
  const maxAlternatives = browser || speechServices;
  const referenceGrammarId = bingSpeech || speechServices;
  const telemetry = speechServices;

  return {
    bingSpeech,
    browser,
    bundle,
    customSpeech,
    customVoice,
    dynamicPhrases,
    inverseTextNormalization,
    maxAlternatives,
    npm,
    referenceGrammarId,
    speechServices,
    telemetry
  };
}
