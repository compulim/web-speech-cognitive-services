export default function browserSupportedSpeechRecognition(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}
