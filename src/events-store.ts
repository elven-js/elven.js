export class EventsStore {
  private static events: Record<string, (...args: any[]) => void> | undefined;

  static set(name: string, fn: (...args: any[]) => void) {
    if (!name) return;
    const eventsObj = { ...this.events, [name]: fn };
    this.events = eventsObj;
  }

  static get(name: string) {
    if (!name || !this.events) return;
    return this.events[name];
  }

  static run(name: string, ...args: any[]) {
    if (!name || !this.events) return;
    this.events[name]?.(...args);
  }

  static clear() {
    this.events = undefined;
  }
}
