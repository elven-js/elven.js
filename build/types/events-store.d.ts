export declare class EventsStore {
    private static events;
    static set(name: string, fn: () => void): void;
    static get(name: string): (() => void) | undefined;
    static run(name: string): void;
}
