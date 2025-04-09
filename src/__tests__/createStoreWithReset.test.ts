import { createStoreWithReset } from '../index';

// Simple counter store type
interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
}

describe('createStoreWithReset', () => {
  // Test basic functionality
  test('creates store with initial state and actions', () => {
    const useStore = createStoreWithReset<CounterStore>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    }));

    const state = useStore.getState();
    expect(state.count).toBe(0);
    expect(typeof state.increment).toBe('function');
    expect(typeof state.resetStore).toBe('function');
  });

  // Test state updates
  test('updates state when actions are called', () => {
    const useStore = createStoreWithReset<CounterStore>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    }));

    useStore.getState().increment();
    expect(useStore.getState().count).toBe(1);
    
    useStore.getState().increment();
    expect(useStore.getState().count).toBe(2);
    
    useStore.getState().decrement();
    expect(useStore.getState().count).toBe(1);
  });

  // Test reset functionality
  test('resets store to initial state', () => {
    const useStore = createStoreWithReset<CounterStore>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    }));

    useStore.getState().increment();
    useStore.getState().increment();
    expect(useStore.getState().count).toBe(2);
    
    useStore.getState().resetStore();
    expect(useStore.getState().count).toBe(0);
  });

  // Test with nested state
  test('handles nested state correctly', () => {
    interface NestedStore {
      user: { name: string; age: number };
      items: string[];
      updateUser: (name: string, age: number) => void;
      addItem: (item: string) => void;
    }

    const useStore = createStoreWithReset<NestedStore>((set) => ({
      user: { name: 'John', age: 30 },
      items: ['item1'],
      updateUser: (name, age) => set({ user: { name, age } }),
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    }));

    // Update state
    useStore.getState().updateUser('Jane', 25);
    useStore.getState().addItem('item2');

    expect(useStore.getState().user.name).toBe('Jane');
    expect(useStore.getState().items).toEqual(['item1', 'item2']);

    // Reset state
    useStore.getState().resetStore();
    expect(useStore.getState().user.name).toBe('John');
    expect(useStore.getState().items).toEqual(['item1']);
  });

  // Test edge cases
  test('handles special cases correctly', () => {
    interface SpecialStore {
      value: any;
      setValue: (value: any) => void;
    }

    const useStore = createStoreWithReset<SpecialStore>((set) => ({
      value: null,
      setValue: (value) => set({ value }),
    }));

    // Test with undefined
    useStore.getState().setValue(undefined);
    expect(useStore.getState().value).toBeUndefined();
    
    // Test with Date object
    const date = new Date();
    useStore.getState().setValue(date);
    expect(useStore.getState().value).toBe(date);
    
    // Reset should restore null
    useStore.getState().resetStore();
    expect(useStore.getState().value).toBeNull();
  });
}); 