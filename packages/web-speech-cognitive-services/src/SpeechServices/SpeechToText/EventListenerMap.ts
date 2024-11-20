type EventListener<T extends Event> = (event: T) => void;

export default class EventListenerMap<T extends string, EventMap extends Record<T, Event>> {
  constructor(eventTarget: EventTarget) {
    this.#eventTarget = eventTarget;
    this.#propertyMap = {};
  }

  #eventTarget: EventTarget;
  #propertyMap: { [Name in keyof EventMap]?: EventListener<EventMap[Name]> | undefined };

  getProperty(name: T): ((event: EventMap[typeof name]) => void) | undefined {
    return this.#propertyMap[name];
  }

  setProperty(name: T, value: ((event: EventMap[typeof name]) => void) | undefined) {
    const existing = this.#propertyMap[name];

    existing && this.#eventTarget.removeEventListener(name, existing as EventListener<Event>);

    if (value) {
      this.#eventTarget.addEventListener(name, value as EventListener<Event>);
    }

    this.#propertyMap[name] = value;
  }
}
