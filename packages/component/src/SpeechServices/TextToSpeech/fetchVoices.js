import SpeechSynthesisVoice from './SpeechSynthesisVoice';

export default async function ({ authorizationToken, region }) {
  // Although encodeURI on a hostname doesn't work as expected, at least, it will fail peacefully.

  const res = await fetch(
    `https://${ encodeURI(region) }.tts.speech.microsoft.com/cognitiveservices/voices/list`,
    {
      headers: {
        authorization: `Bearer ${ authorizationToken }`,
        'content-type': 'application/json'
      }
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch voices');
  }

  const voices = await res.json();

  return voices
    .map(({ Gender: gender, Locale: lang, Name: voiceURI }) => new SpeechSynthesisVoice({ gender, lang, voiceURI }))
    .sort(({ name: x }, { name: y }) => x > y ? 1 : x < y ? -1 : 0);
}
