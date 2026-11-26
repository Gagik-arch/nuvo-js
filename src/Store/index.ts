import { isEqualObjects, isPlainObject } from '../helpers';
import type { Unsubscribe } from './types'

class Store<T> {
    private state: T;
    private listeners: ((state: T) => void)[] = [];

    public constructor(initialState: T) {
        this.state = initialState;
    }

    public Subscribe(callback: (state: T) => void): Unsubscribe {
        this.listeners.push(callback);

        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    public Effect(callback: (state: T) => void): Unsubscribe {
        callback(this.GetState());

        return this.Subscribe(callback);
    }

    public SetState(newState: T | ((prev: T) => T)) {
        const state
            = typeof newState === 'function'
                ? (newState as (prev: T) => T)(this.state)
                : newState;

        if (isPlainObject(this.state) && isPlainObject(state)) {
            if (!isEqualObjects(this.state, state)) {
                this.state = state;
                this.Notify();
            }
        } else {
            if (this.state === state) return;

            this.state = state;
            this.Notify();
        }
    }

    public GetState() {
        return this.state;
    }

    private Notify() {
        this.listeners.forEach((listener) => {
            listener(this.state);
        });
    }
}

export default Store;
