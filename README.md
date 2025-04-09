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
import { createWithReset } from "zustand-with-reset";

const store = createWithReset((set) => ({
  count: 0,
  secondaryCount: 10,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

- Use the store you normally would

```ts
const count = useStore((state) => state.count);
const increment = useStore((state) => state.increment);
```

- To reset the entire store

```ts
const resetStore = useStore((state) => state.resetStore);

//now you can reset the store on unmount or when needed
useEffect(() => {
  return () => {
    resetStore();
  };
}, []);
```

- To reset specific state properties

```ts
const resetState = useStore((state) => state.resetState);
//now reset only the count property 
resetState("count");
// or reset multiple properties
resetState("count", "secondaryCount");
// alternate syntax
resetState(["count", "secondaryCount"]);
```

