export class EventsStore {
  private static events: Record<string, (arg?: any) => void> | undefined;

  static set(name: string, fn: (arg?: any) => void) {
    if (!name) return;
    const eventsObj = { ...this.events, [name]: fn };
    this.events = eventsObj;
  }

  static get(name: string) {
    if (!name || !this.events) return;
    return this.events[name];
  }

  static run(name: string, arg?: any) {
    if (!name || !this.events) return;
    this.events[name]?.(arg);
  }

  static clear() {
    this.events = undefined;
  }
}
