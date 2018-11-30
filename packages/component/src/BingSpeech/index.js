// import createFetchTokenUsingSubscriptionKey from './util/createFetchTokenUsingSubscriptionKey';
// import SpeechGrammarList from './recognition/SpeechGrammarList';
// import SpeechRecognition from './recognition/SpeechRecognition';
// import speechSynthesis from './synthesis/speechSynthesis';
// import SpeechSynthesisUtterance from './synthesis/SpeechSynthesisUtterance';

// export {
//   createFetchTokenUsingSubscriptionKey,
//   SpeechGrammarList,
//   SpeechRecognition,
//   speechSynthesis,
//   SpeechSynthesisUtterance
// }

import createSpeechRecognitionPonyfill from './SpeechToText/createSpeechRecognitionPonyfill';
import fetchAuthorizationToken from './Util/fetchAuthorizationToken';

export default async function (...args) {
  return await {
    ...(await createSpeechRecognitionPonyfill(...args))
  };
}

export {
  createSpeechRecognitionPonyfill,
  fetchAuthorizationToken
}
