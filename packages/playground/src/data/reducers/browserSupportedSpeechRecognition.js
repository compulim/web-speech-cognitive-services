export default function () {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}
