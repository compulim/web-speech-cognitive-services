export default function browserSupportedSpeechRecognition() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}
