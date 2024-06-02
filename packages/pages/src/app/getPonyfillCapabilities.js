export default function getPonyfillCapabilities(ponyfillType) {
  const browser = ponyfillType === 'browser';
  const speechServices = /^speechservices:/u.test(ponyfillType);

  const bundle = browser || ponyfillType === 'speechservices:bundle';
  const npm = ponyfillType === 'speechservices:npm';

  const customSpeech = speechServices;
  const customVoice = speechServices;
  const dynamicPhrases = speechServices;
  const inverseTextNormalization = speechServices;
  const maxAlternatives = browser || speechServices;
  const referenceGrammarId = speechServices;
  const telemetry = speechServices;

  return {
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
