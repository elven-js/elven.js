import { LOCAL_STORAGE_KEY } from './constants';

// Local storage helpers for the Elven.js key
export const ls = {
  get(key?: string) {
    const state = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!state) return {};

    const parsedState = JSON.parse(state);

    if (key) {
      return parsedState[key];
    }

    return parsedState;
  },
  set(key: string, value: string | number) {
    const currentState = this.get();
    currentState[key] = value;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentState));
  },
  clear() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  },
};
