# @nuvo-js/core

**Nuvo** is a lightweight, TypeScript-first UI library built around native DOM APIs.

Nuvo provides a class-based approach to building web interfaces without JSX or unnecessary rendering abstractions. It gives developers direct control over HTML and SVG elements while providing reactive state management and efficient DOM updates through keyed and unkeyed diffing.

## Features

- **DOM-first architecture** — Direct interaction with native DOM elements.
- **TypeScript support** — Generic types and public type definitions.
- **HTML elements** — Create and configure native HTML elements.
- **SVG elements** — Build SVG graphics using the same architecture.
- **Reactive Store** — Manage application state with subscriptions and effects.
- **DOM Diffing** — Efficiently update existing DOM elements.
- **Keyed Diffing** — Reuse, insert, remove, and reorder elements using unique keys.
- **No Virtual DOM** — Work directly with real DOM elements.
- **No JSX required** — Build interfaces using standard JavaScript and TypeScript.
- **Lightweight** — Built around native browser APIs.

## Demo

🌐 Live demo: https://example-ten-opal.vercel.app

## Installation

Install using npm:

```bash
npm install @nuvo-js/core
```

## Usage

### Browser Global

Nuvo is also accessible through the browser global namespace:

```javascript
const nuvojs = window['nuvo-js'];

console.log(nuvojs);
```

### ECMAScript Modules

Import `createRoot` from the package and mount your application to a DOM element.

**main.ts**

```typescript
import { createRoot } from '@nuvo-js/core';
import App from './App';

const root = document.getElementById('app');

createRoot(root!, App());
```

**index.html**

```html
<div id="app"></div>
```

## HTML Elements

Create native HTML elements using the `Element` class.

Each instance accepts a configuration object containing a `tagName` and `props`.

```typescript
import { Element } from '@nuvo-js/core';

const element = new Element<HTMLDivElement>({
    tagName: 'div',
    props: {
        className: 'row',
        children: [
            'I am div element.'
        ]
    }
});
```

The `.dom` property provides access to the underlying native DOM element.

### TypeScript Generics

You can specify the native HTML element type using generics:

```typescript

const button = new Element<HTMLButtonElement>({
    tagName: 'button',
    props: {
        children: ['Click me']
    }
});

const div = new Element<HTMLDivElement>({
    tagName: 'div',
    props: {
        className: 'container',
        children:[button.dom]
    }
});

```

This provides better TypeScript support when working with native DOM elements.

### Updating Properties

Use `SetProps()` to update element properties:

```typescript
div.SetProps({
    className: 'container active',
    title: 'Updated container'
});
```

`SetProps()` updates the existing DOM element rather than requiring a new element instance.

## SVG Elements

Nuvo also provides an `SVGElement` class for creating SVG elements.

You can use it to build reusable SVG components while maintaining TypeScript support.

### Example: Trash Icon

```typescript
import { SVGElement } from '@nuvo-js/core';
import type { SVGElementPropsType } from '@nuvo-js/core/types';

function Trash(props: SVGElementPropsType) {
    return new SVGElement({
        tagName: 'svg',
        props: {
            xmlns: 'http://www.w3.org/2000/svg',
            width: 24,
            height: 24,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            ...props,
            children: [
                new SVGElement<SVGPolylineElement>({
                    tagName: 'polyline',
                    props: {
                        points: '3 6 5 6 21 6'
                    }
                }).dom,

                new SVGElement<SVGPathElement>({
                    tagName: 'path',
                    props: {
                        d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'
                    }
                }).dom
            ]
        }
    }).dom;
}

export default Trash;
```

The component returns a native SVG DOM element and accepts SVG properties through `SVGElementPropsType`.

## Fragment

Nuvo provides `Fragment` for grouping multiple elements without introducing an additional wrapper element into the DOM.

```typescript
import { Element, Fragment } from '@nuvo-js/core';

function App() {
    return Fragment([
        new Element<HTMLDivElement>({
            tagName: 'div',
            props: {
                children: ['First element']
            }
        }).dom,

        new Element<HTMLDivElement>({
            tagName: 'div',
            props: {
                children: ['Second element']
            }
        }).dom
    ]);
}
```

Fragments are useful for composing UI structures while keeping the resulting DOM hierarchy clean.

## Store

Nuvo includes a reactive `Store` class for application state management.

Create a store by providing an initial state and its corresponding TypeScript type.

### Creating a Store

```typescript
import { Store } from '@nuvo-js/core';

const store = new Store<number[]>([]);
```

### Get State

Retrieve the current state:

```typescript
const state = store.GetState();

console.log(state);
```

### Set State

Update the state by providing a new value:

```typescript
store.SetState([1, 2, 3]);
```

You can also use a callback to update the previous state:

```typescript
store.SetState(prev => [
    ...prev,
    4
]);
```

### Subscribe

Listen for state changes.

`Subscribe()` executes its callback when the store state changes.

```typescript
store.Subscribe(() => {
    console.log('Store updated!');
});
```

### Effect

`Effect()` executes its callback immediately when registered and again whenever the store state changes.

```typescript
store.Effect((state) => {
    console.log('Current state:', state);
});
```

### Store API Reference

| Method | Description |
|---|---|
| `GetState()` | Returns the current state. |
| `SetState(value)` | Updates the state with a new value. |
| `SetState(callback)` | Updates the state using the previous value. |
| `Subscribe(callback)` | Listens for state changes. |
| `Effect(callback)` | Executes immediately and listens for subsequent state changes. |

## DOM Diffing

Nuvo provides DOM diffing to update existing elements without unnecessarily replacing the entire DOM structure.

When updating an element's children through `SetProps()`, Nuvo compares the existing children with the new children.

Nuvo supports two reconciliation strategies:

- **Unkeyed Diffing** — Compares children by their position in the DOM.
- **Keyed Diffing** — Identifies children using unique keys and reconciles them independently of their position.

### Unkeyed Diffing

For collections without keys, Nuvo compares elements by their position.

```typescript
const list = new Element<HTMLUListElement>({
    tagName: 'ul',
    props: {
        children: [
            new Element<HTMLLIElement>({
                tagName: 'li',
                props: {
                    children: ['Item 1']
                }
            }).dom,

            new Element<HTMLLIElement>({
                tagName: 'li',
                props: {
                    children: ['Item 2']
                }
            }).dom
        ]
    }
});
```

### Keyed Diffing

When rendering dynamic collections, you can assign a unique `key` to each element.

```typescript
key: item.id
```

Nuvo uses these keys to identify and reuse existing DOM elements.

The keyed diffing process:

- **Reuse** — Reuses existing DOM elements with matching keys.
- **Remove** — Removes elements whose keys no longer exist.
- **Insert** — Inserts newly created elements.
- **Reorder** — Moves existing DOM elements when their order changes.

### Example: Reactive Todo List

```typescript
import { Element, Store } from '@nuvo-js/core';

interface Todo {
    id: string;
    title: string;
}

const todos = new Store<Todo[]>([]);

const list = new Element<HTMLOListElement>({
    tagName: 'ol',
    props: {
        children: []
    }
});

todos.Effect((state) => {
    list.SetProps({
        children: state.map(todo =>
            new Element<HTMLLIElement>({
                tagName: 'li',
                props: {
                    key: todo.id,
                    children: [
                        todo.title
                    ]
                }
            }).dom
        )
    });
});

// Add a todo
todos.SetState(prev => [
    ...prev,
    {
        id: crypto.randomUUID(),
        title: 'Learn Nuvo'
    }
]);

// Remove a todo
todos.SetState(prev =>
    prev.filter(todo => todo.id !== 'some-id')
);
```

### Key Best Practices

- Always use unique keys among sibling elements.
- Prefer stable identifiers such as database IDs or UUIDs.
- Avoid array indexes as keys when elements can be reordered or removed.
- Use consistent keys when rendering dynamic collections.
- When using keyed diffing, provide keys for all sibling elements.

## TypeScript Support

Nuvo Core is written in TypeScript and provides public type definitions.

Import types directly from the package:

```typescript
import type {
    ElementPropsType,
    SVGElementPropsType
} from '@nuvo-js/core/types';
```

## Philosophy

Nuvo focuses on simplicity, control, and native browser capabilities.

Rather than introducing another abstraction layer between developers and the DOM, Nuvo provides tools to work directly with the platform.

Inspired by the Italian word nuovo and the French word nouveau, both meaning new, fresh, or recently developed, the name reflects Nuvo's vision of bringing a fresh, simple, and modern approach to building web interfaces.

Build with JavaScript. Control the DOM. Keep things simple.

Nuvo — A fresh approach to the DOM.

## License

MIT
