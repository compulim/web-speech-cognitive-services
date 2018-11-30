export default function subscribeEvent(target, name, handler) {
  target.addEventListener(name, handler);

  return () => target.removeEventListener(name, handler);
}
