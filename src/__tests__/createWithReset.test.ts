import { describe, test, expect, beforeEach } from 'vitest';
import { createWithReset } from '../index';
import { StoreApi, UseBoundStore } from 'zustand';
import { StoreWithReset } from '../index';

// Simple counter store type
interface CounterStore {
  count: number;
  secondaryCount: number;
  increment: () => void;
  decrement: () => void;
}

describe('createWithReset', () => {
  let useStore: UseBoundStore<StoreApi<StoreWithReset<CounterStore>>>;
  
  // Set up a fresh store before each test
  beforeEach(() => {
    useStore = createWithReset<CounterStore>((set) => ({
      count: 0,
      secondaryCount: 10,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    }));
  });

  // Test basic functionality
  test('creates store with initial state and actions', () => {
    const count = useStore.getState().count;
    const secondaryCount = useStore.getState().secondaryCount;
    const increment = useStore.getState().increment;
    const resetStore = useStore.getState().resetStore;
    const resetState = useStore.getState().resetState;

    expect(count).toBe(0);
    expect(secondaryCount).toBe(10);
    expect(typeof increment).toBe('function');
    expect(typeof resetStore).toBe('function');
    expect(typeof resetState).toBe('function');
  });

  // Test state updates
  test('updates state when actions are called', () => {
    useStore.getState().increment();
    expect(useStore.getState().count).toBe(1);
    
    useStore.getState().increment();
    expect(useStore.getState().count).toBe(2);
    
    useStore.getState().decrement();
    expect(useStore.getState().count).toBe(1);
  });

  // Test reset functionality
  test('resets store to initial state', () => {
    useStore.getState().increment();
    useStore.getState().increment();
    expect(useStore.getState().count).toBe(2);
    
    useStore.getState().resetStore();
    expect(useStore.getState().count).toBe(0);
  });

  // Test resetState functionality with a single key
  test('resets specific state property with a single key', () => {
    // Update both counts
    useStore.setState({ count: 5, secondaryCount: 15 });
    expect(useStore.getState().count).toBe(5);
    expect(useStore.getState().secondaryCount).toBe(15);
    
    // Reset only count
    useStore.getState().resetState('count');
    
    // Count should be reset, secondaryCount should remain changed
    expect(useStore.getState().count).toBe(0);
    expect(useStore.getState().secondaryCount).toBe(15);
  });

  // Test resetState functionality with multiple keys
  test('resets multiple state properties with multiple arguments', () => {
    // Update both counts
    useStore.setState({ count: 5, secondaryCount: 15 });
    expect(useStore.getState().count).toBe(5);
    expect(useStore.getState().secondaryCount).toBe(15);
    
    // Reset both properties using multiple arguments
    useStore.getState().resetState('count', "secondaryCount");
    
    // Both should be reset
    expect(useStore.getState().count).toBe(0);
    expect(useStore.getState().secondaryCount).toBe(10);
  });

  // Test resetState functionality with an array of keys
  test('resets multiple state properties with an array argument', () => {
    // Update both counts
    useStore.setState({ count: 5, secondaryCount: 15 });
    
    // Reset both properties using array syntax
    useStore.getState().resetState(['count', "secondaryCount"]);
    
    // Both should be reset
    expect(useStore.getState().count).toBe(0);
    expect(useStore.getState().secondaryCount).toBe(10);
  });

  // Test resetState with mixed argument types
  test('resets state properties with mixed argument types', () => {
    // Update both counts
    useStore.setState({ count: 5, secondaryCount: 15 });
    
    // Reset using mixed syntax (single key and array)
    useStore.getState().resetState('count', ['secondaryCount']);
    
    // Both should be reset
    expect(useStore.getState().count).toBe(0);
    expect(useStore.getState().secondaryCount).toBe(10);
  });
});

// Separate describe blocks for different store types
describe('createWithReset with nested state', () => {
  interface NestedStore {
    user: { name: string; age: number };
    items: string[];
    updateUser: (name: string, age: number) => void;
    addItem: (item: string) => void;
  }

  let useStore: UseBoundStore<StoreApi<StoreWithReset<NestedStore>>>;
  
  beforeEach(() => {
    useStore = createWithReset<NestedStore>((set) => ({
      user: { name: 'John', age: 30 },
      items: ['item1'],
      updateUser: (name, age) => set({ user: { name, age } }),
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    }));
  });

  test('handles nested state correctly', () => {
    // Update state
    useStore.getState().updateUser('Jane', 25);
    useStore.getState().addItem('item2');

    expect(useStore.getState().user.name).toBe('Jane');
    expect(useStore.getState().items).toEqual(['item1', 'item2']);

    // Reset specific properties
    useStore.getState().resetState('user');
    
    // User should be reset, items should remain changed
    expect(useStore.getState().user.name).toBe('John');
    expect(useStore.getState().items).toEqual(['item1', 'item2']);
    
    // Reset items
    useStore.getState().resetState('items');
    expect(useStore.getState().items).toEqual(['item1']);
  });
});

describe('createWithReset with special values', () => {
  interface SpecialStore {
    value: any;
    setValue: (value: any) => void;
  }

  let useStore: UseBoundStore<StoreApi<StoreWithReset<SpecialStore>>>;
  
  beforeEach(() => {
    useStore = createWithReset<SpecialStore>((set) => ({
      value: null,
      setValue: (value) => set({ value }),
    }));
  });

  test('handles special cases correctly', () => {
    // Test with undefined
    useStore.getState().setValue(undefined);
    expect(useStore.getState().value).toBeUndefined();
    
    // Reset should restore null
    useStore.getState().resetState('value');
    expect(useStore.getState().value).toBeNull();
    
    // Test with Date object
    const date = new Date();
    useStore.getState().setValue(date);
    expect(useStore.getState().value).toBe(date);
    
    // Reset should restore null
    useStore.getState().resetState('value');
    expect(useStore.getState().value).toBeNull();
  });
}); 