export class EventsStore {
  private static events: Record<string, () => void> = {};

  static set(name: string, fn: () => void) {
    if (!name) return;
    this.events[name] = fn;
  }

  static get(name: string) {
    if (!name) return;
    return this.events[name];
  }

  static run(name: string) {
    if (!name) return;
    this.events[name]?.();
  }
}
