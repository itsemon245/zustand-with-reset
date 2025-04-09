# Zustand With Reset

A utility library for creating Zustand stores with automatic reset functionality.

## Installation

- **NPM**

```bash
npm install zustand-with-reset
```

- **PNPM**

```bash
pnpm add zustand-with-reset
```

- **Yarn**

```bash
yarn add zustand-with-reset
```

- **Bun**

```bash
bun add zustand-with-reset
```

## Usage

- Create a store with automatic reset functionality

```ts
import { createStore } from "zustand-with-reset";

const store = createStore((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

- Use the store you normally would

```ts
const count = useStore((state) => state.count);
const increment = useStore((state) => state.increment);
```

- To reset the store

```ts
const resetStore = useStore((state) => state.resetStore);

//now you can reset the store on unmount or when needed
useEffect(() => {
  return () => {
    resetStore();
  };
}, []);
```
