type EventListener<T> = (event: T) => void;

export default class EventListenerMap<T extends string, EventMap extends { [Name in T]: unknown }> {
  constructor(eventTarget: EventTarget) {
    this.#eventTarget = eventTarget;
    this.#propertyMap = {};
  }

  #eventTarget: EventTarget;
  #propertyMap: { [Name in keyof EventMap]?: EventListener<EventMap[Name]> | undefined };

  getProperty<U extends T>(name: U): ((event: EventMap[U]) => void) | undefined {
    return this.#propertyMap[name];
  }

  setProperty<U extends T>(name: U, value: ((event: EventMap[U]) => void) | undefined) {
    const existing = this.#propertyMap[name];

    existing && this.#eventTarget.removeEventListener(name, existing as EventListener<Event>);

    if (value) {
      this.#eventTarget.addEventListener(name, value as EventListener<Event>);
    }

    this.#propertyMap[name] = value;
  }
}
