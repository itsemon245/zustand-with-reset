import { create, StateCreator, StoreApi, UseBoundStore } from 'zustand';

/**
 * Utility type that extracts only the non-function properties from a type.
 * Used to separate state data from methods in a store.
 * 
 * @template T - The type to extract properties from
 */
export type Properties<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K]
};

/**
 * Utility type that adds a resetStore function to any store type.
 * This ensures TypeScript knows the store has this function.
 * 
 * @template T - The original store type
 */
export type StoreWithReset<T> = T & {
  /**
   * Resets the store to its initial state.
   * This function is automatically added by the createStore utility.
   */
  resetStore: () => void;
};

/**
 * Creates a Zustand store with automatic state management features:
 * - Automatically extracts initial state from non-function properties
 * - Adds a resetStore function that resets to initial state
 * - Preserves the standard Zustand API and type safety
 * 
 * @template T - The type of the store state (without the resetStore function)
 * @param createState - A function that creates the store state and actions
 * @returns A Zustand store hook with resetStore functionality
 * 
 * @example
 * ```typescript
 * interface CounterStore {
 *   count: number;
 *   increment: () => void;
 *   decrement: () => void;
 * }
 * 
 * const useCounterStore = createStore<CounterStore>((set) => ({
 *   count: 0,
 *   increment: () => set(state => ({ count: state.count + 1 })),
 *   decrement: () => set(state => ({ count: state.count - 1 }))
 * }));
 * 
 * // The store now has a resetStore function
 * // useCounterStore.getState().resetStore();
 * ```
 */
export function createStore<T extends object>(
  createState: StateCreator<T, [], []>
): UseBoundStore<StoreApi<StoreWithReset<T>>> {
  // Create a store with the state creator
  return create<StoreWithReset<T>>((set, get, api) => {
    // Get the state from the creator
    const state = createState(set, get, api);
    
    // Extract non-function properties for the initial state
    const initialState: Partial<T> = {};
    
    // Use Object.entries with proper type handling
    Object.keys(state).forEach(key => {
      const k = key as keyof typeof state;
      if (typeof state[k] !== 'function') {
        initialState[k as keyof T] = state[k] as any;
      }
    });
    
    // Return the state with resetStore function
    return {
      ...state,
      resetStore: () => set(initialState as Partial<StoreWithReset<T>>)
    };
  });
} 