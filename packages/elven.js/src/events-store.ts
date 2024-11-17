import { EventStoreEvents } from './types';

let events: Record<string, (...args: any[]) => void> | undefined;

export function set(name: EventStoreEvents, fn: (...args: any[]) => void) {
  if (!name) return;
  events = { ...events, [name]: fn };
}

export function get(name: EventStoreEvents) {
  if (!name || !events) return;
  return events[name];
}

export function run(name: EventStoreEvents, ...args: any[]) {
  if (!name || !events) return;
  events[name]?.(...args);
}

export function clear() {
  events = undefined;
}
