import 'babel-polyfill';

import SpeechGrammarList from './recognition/SpeechGrammarList';
import SpeechRecognition from './recognition/SpeechRecognition';
import speechSynthesis from './synthesis/speechSynthesis';
import SpeechSynthesisUtterance from './synthesis/SpeechSynthesisUtterance';

export default SpeechRecognition

export {
  SpeechGrammarList,
  SpeechRecognition,
  speechSynthesis,
  SpeechSynthesisUtterance
}
