import { EventStoreEvents } from './types';

export class EventsStore {
  private static events: Record<string, (...args: any[]) => void> | undefined;

  static set(name: EventStoreEvents, fn: (...args: any[]) => void) {
    if (!name) return;
    const eventsObj = { ...this.events, [name]: fn };
    this.events = eventsObj;
  }

  static get(name: EventStoreEvents) {
    if (!name || !this.events) return;
    return this.events[name];
  }

  static run(name: EventStoreEvents, ...args: any[]) {
    if (!name || !this.events) return;
    this.events[name]?.(...args);
  }

  static clear() {
    this.events = undefined;
  }
}
