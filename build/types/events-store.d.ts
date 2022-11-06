export declare class EventsStore {
    private static events;
    static set(name: string, fn: (arg?: any) => void): void;
    static get(name: string): ((arg?: any) => void) | undefined;
    static run(name: string, arg?: any): void;
    static clear(): void;
}
