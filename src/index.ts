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
 * Utility type that adds reset functions to any store type.
 * This ensures TypeScript knows the store has these functions.
 * 
 * @template T - The original store type
 */
export type StoreWithReset<T> = T & {
  /**
   * Resets the entire store to its initial state.
   * This function is automatically added by the createWithReset utility.
   */
  resetStore: () => void;
  
  /**
   * Resets specific state properties to their initial values.
   * @param keys - The keys of the state properties to reset (as a single key, multiple keys, or array of keys)
   */
  resetState: <K extends keyof Properties<T>>(...keys: (K | K[])[]) => void;
};

/**
 * Creates a Zustand store with advanced reset functionality:
 * - Automatically extracts initial state from non-function properties
 * - Adds resetStore function that resets to initial state (if not already defined)
 * - Adds resetState function that resets specific state properties (if not already defined)
 * - Preserves the standard Zustand API and type safety
 * 
 * @template T - The type of the store state (without the reset functions)
 * @param createState - A function that creates the store state and actions
 * @returns A Zustand store hook with reset functionality
 * 
 * @example
 * ```typescript
 * interface CounterStore {
 *   count: number;
 *   secondaryCount: number;
 *   increment: () => void;
 *   decrement: () => void;
 * }
 * 
 * const useCounterStore = createWithReset<CounterStore>((set) => ({
 *   count: 0,
 *   secondaryCount: 10,
 *   increment: () => set(state => ({ count: state.count + 1 })),
 *   decrement: () => set(state => ({ count: state.count - 1 }))
 * }));
 * 
 * // Reset the entire store
 * useCounterStore.getState().resetStore();
 * 
 * // Reset only specific properties
 * useCounterStore.getState().resetState('count');
 * useCounterStore.getState().resetState(['count', 'secondaryCount']);
 * ```
 */
export function createWithReset<T extends object>(
  createState: StateCreator<T, [], []>
): UseBoundStore<StoreApi<StoreWithReset<T>>> {
  // Create a store with the state creator
  return create<StoreWithReset<T>>((set, get, api) => {
    // Get the state from the creator
    const state = createState(set, get, api);
    
    // Extract non-function properties for the initial state
    const initialState: Partial<T> = {};
    
    // Use Object.keys with proper type handling
    Object.keys(state).forEach(key => {
      const k = key as keyof typeof state;
      if (typeof state[k] !== 'function') {
        initialState[k as keyof T] = state[k] as any;
      }
    });
    
    // Check if user has already defined reset functions
    const userDefinedResetStore = 'resetStore' in state && typeof (state as any).resetStore === 'function';
    const userDefinedResetState = 'resetState' in state && typeof (state as any).resetState === 'function';
    
    // Create default reset functions if not defined by user
    const defaultResetStore = () => set(initialState as Partial<StoreWithReset<T>>);
    const defaultResetState = <K extends keyof Properties<T>>(...keys: (K | K[])[]) => {
      // Flatten the keys array (handles both individual keys and arrays of keys)
      const keysToReset: K[] = keys.flat() as K[];
      const resetValues: Partial<T> = {};
      
      keysToReset.forEach(key => {
        if (key in initialState) {
          resetValues[key] = initialState[key];
        }
      });
      
      set(resetValues as Partial<StoreWithReset<T>>);
    };
    
    // Return the state with reset functions (using user-defined ones if available)
    return {
      ...state,
      resetStore: userDefinedResetStore ? (state as any).resetStore : defaultResetStore,
      resetState: userDefinedResetState ? (state as any).resetState : defaultResetState
    } as StoreWithReset<T>;
  });
} 