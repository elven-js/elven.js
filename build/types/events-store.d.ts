export declare class EventsStore {
    private static events;
    static set(name: string, fn: (...args: any[]) => void): void;
    static get(name: string): ((...args: any[]) => void) | undefined;
    static run(name: string, ...args: any[]): void;
    static clear(): void;
}
