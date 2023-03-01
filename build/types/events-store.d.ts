import { EventStoreEvents } from './types';
export declare class EventsStore {
    private static events;
    static set(name: EventStoreEvents, fn: (...args: any[]) => void): void;
    static get(name: EventStoreEvents): ((...args: any[]) => void) | undefined;
    static run(name: EventStoreEvents, ...args: any[]): void;
    static clear(): void;
}
