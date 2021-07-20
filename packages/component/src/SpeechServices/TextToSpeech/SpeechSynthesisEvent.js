import { Event } from 'event-target-shim/es5';

export default class SpeechSynthesisEvent extends Event {
  constructor(type) {
    super(type);
  }
}
