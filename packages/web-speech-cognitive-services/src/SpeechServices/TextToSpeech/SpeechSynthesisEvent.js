import { Event } from 'event-target-shim';

export default class SpeechSynthesisEvent extends Event {
  constructor(type) {
    super(type);
  }
}
