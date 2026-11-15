# @nuvo-js/core

**Nuvo** is a lightweight, TypeScript-first UI library built around native DOM APIs.

Nuvo provides a class-based approach to building web interfaces without JSX or a Virtual DOM. It gives developers direct control over HTML and SVG elements while providing reactive state management and efficient DOM updates through keyed and unkeyed diffing.

## Features

- **DOM-first architecture** — Work directly with native DOM elements.
- **TypeScript support** — Generic element types and public type definitions.
- **HTML elements** — Create, configure, and update native HTML elements.
- **SVG elements** — Build SVG graphics using the same class-based approach.
- **Event management** — Register and clean up native DOM event listeners.
- **Lifecycle callbacks** — Respond to element mount and unmount events.
- **Reactive Store** — Manage application state with subscriptions and effects.
- **DOM diffing** — Efficiently update existing child nodes.
- **Keyed diffing** — Reuse, insert, remove, and reorder elements using keys.
- **No Virtual DOM** — Reconcile actual DOM nodes.
- **No JSX required** — Build interfaces with standard JavaScript and TypeScript.

## Demo

🌐 Live demo: https://example-ten-opal.vercel.app

## Installation

```bash
npm install @nuvo-js/core
```

## Usage

### ECMAScript modules

Import `createRoot` from the package and mount your application to a DOM element.

**main.ts**

```typescript
import { createRoot } from '@nuvo-js/core';
import App from './App';

const root = document.getElementById('app');

if (root) {
    createRoot(root, App());
}
```

**index.html**

```html
<div id="app"></div>
```

### Browser global

Nuvo is also accessible through the browser global namespace:

```javascript
const nuvojs = window['nuvo-js'];

console.log(nuvojs);
```

## HTML Elements

Create native HTML elements using the `Element` class. The constructor accepts the HTML tag name, a props object, and an optional parent element.

```typescript
import { Element } from '@nuvo-js/core';

const element = new Element<HTMLDivElement>(
    'div',
    {
        className: 'row',
        children: [
            'I am a div element.'
        ]
    }
);

document.body.append(element.dom);
```

The `.dom` property provides access to the underlying native DOM element.

You can also pass a parent as the third constructor argument to append the element immediately:

```typescript
const element = new Element<HTMLDivElement>(
    'div',
    {
        className: 'container',
        children: ['Hello Nuvo']
    },
    document.body
);
```

### TypeScript generics

Specify the native element type with a generic to get the corresponding DOM API and type information:

```typescript
const button = new Element<HTMLButtonElement>(
    'button',
    {
        children: ['Click me']
    }
);

const input = new Element<HTMLInputElement>(
    'input',
    {
        type: 'text',
        placeholder: 'Enter your name'
    }
);
```

### Children

The `children` prop must be an array. It can contain text and DOM nodes created by Nuvo or other native DOM APIs.

```typescript
const button = new Element<HTMLButtonElement>(
    'button',
    {
        children: ['Click me']
    }
);

const container = new Element<HTMLDivElement>(
    'div',
    {
        className: 'container',
        children: [
            'A button: ',
            button.dom
        ]
    }
);
```

### Updating properties

Use `SetProps()` to update an existing element:

```typescript
const div = new Element<HTMLDivElement>(
    'div',
    {
        className: 'container'
    }
);

div.SetProps({
    className: 'container active',
    title: 'Updated container'
});
```

`SetProps()` updates the existing DOM element rather than creating a new instance.

You can also update children. Nuvo reconciles the new child array with the existing DOM children:

```typescript
div.SetProps({
    children: [
        'Updated content'
    ]
});
```

Pass `true` as the second argument to force the child update:

```typescript
div.SetProps(
    {
        children: ['Fresh content']
    },
    true
);
```

### Events

Pass native event listeners through the `events` prop. Event names use the `on` prefix:

```typescript
const button = new Element<HTMLButtonElement>(
    'button',
    {
        children: ['Click me'],
        events: {
            onClick: () => {
                console.log('Button clicked');
            }
        }
    }
);
```

Use `SetEvents()` to replace the element's current event listeners:

```typescript
button.SetEvents({
    onClick: () => {
        console.log('Updated click handler');
    }
});
```

Nuvo manages listeners with an `AbortController`. Calling `SetEvents()` aborts the previous listeners before registering the new ones. Calling `Destroy()` also aborts the element's listeners.

### Mount and unmount lifecycle

Use `OnMount()` to run a callback when the element is connected to the document:

```typescript
div.OnMount((element) => {
    console.log('Mounted:', element.dom);
});
```

Use `OnUnMount()` to respond when the element is disconnected. The callback receives the Nuvo element instance; after the callback, Nuvo destroys the element and its managed event listeners.

```typescript
div.OnUnMount((element) => {
    console.log('Unmounted:', element.dom);
});
```

### Removing and destroying elements

`Remove()` removes the DOM node from its parent.

```typescript
div.Remove();
```

`Destroy()` aborts the element's managed event listeners and removes the DOM node.

```typescript
div.Destroy();
```

## SVG Elements

Nuvo provides an `SVGElement` class for creating native SVG elements. It uses the SVG namespace and exposes the underlying SVG node through `.dom`.

```typescript
import { SVGElement } from '@nuvo-js/core';

const circle = new SVGElement<SVGCircleElement>(
    'circle',
    {
        cx: 12,
        cy: 12,
        r: 10,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2
    },
    document.body
);
```

### Example: reusable trash icon

You can compose an SVG element with child SVG DOM nodes:

```typescript
import { SVGElement } from '../../../../../dist';
import type { SVGElementPropsType } from '../../../../../dist/types';

function Trash(props: SVGElementPropsType) {
    return (
        new SVGElement('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: 24,
            height: 24,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 4,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            ...props,
            children: [
                new SVGElement<SVGPolylineElement>('polyline',
                    {
                        points: '3 6 5 6 21 6' as SVGPointList & string,
                        strokeWidth: 4,
                    }).dom,

                new SVGElement<SVGPathElement>('path',
                    {
                        strokeWidth: 4,
                        d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
                    }).dom
            ],
        }).dom
    );
}

export default Trash;

```

The `SVGElement` constructor accepts the SVG tag name, a props object, and a parent element. SVG attributes are applied to the native SVG node, and `.dom` exposes that node.

## Fragment

Nuvo provides `Fragment` for grouping multiple elements without introducing an additional wrapper element into the DOM.

```typescript
import { Element, Fragment } from '@nuvo-js/core';

function App() {
    return Fragment([
        new Element<HTMLDivElement>(
            'div',
            {
                children: ['First element']
            }
        ).dom,

        new Element<HTMLDivElement>(
            'div',
            {
                children: ['Second element']
            }
        ).dom
    ]);
}
```

Fragments are useful for composing UI structures while keeping the resulting DOM hierarchy clean.

## Store

Nuvo includes a reactive `Store` class for application state management.

### Creating a store

```typescript
import { Store } from '@nuvo-js/core';

const store = new Store<number[]>([]);
```

### Get state

Retrieve the current state with `GetState()`:

```typescript
const state = store.GetState();

console.log(state);
```

### Set state

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

Use `Subscribe()` to listen for state changes:

```typescript
store.Subscribe(() => {
    console.log('Store updated!');
});
```

### Effect

`Effect()` executes its callback immediately when registered and again whenever the store state changes:

```typescript
store.Effect((state) => {
    console.log('Current state:', state);
});
```

### Store API reference

| Method | Description |
|---|---|
| `GetState()` | Returns the current state. |
| `SetState(value)` | Updates the state with a new value. |
| `SetState(callback)` | Updates the state using the previous value. |
| `Subscribe(callback)` | Listens for state changes. |
| `Effect(callback)` | Executes immediately and listens for subsequent state changes. |

## DOM Diffing

Nuvo updates existing child nodes rather than unnecessarily replacing the entire DOM structure.

When you update an element's `children` through `SetProps()`, Nuvo compares the existing children with the new children.

Nuvo supports two reconciliation strategies:

- **Unkeyed diffing** — Compares children by their position in the DOM.
- **Keyed diffing** — Identifies children using unique keys and reconciles them independently of their position.

### Unkeyed diffing

For collections without keys, Nuvo compares elements by their position:

```typescript
const list = new Element<HTMLUListElement>(
    'ul',
    {
        children: [
            new Element<HTMLLIElement>(
                'li',
                {
                    children: ['Item 1']
                }
            ).dom,

            new Element<HTMLLIElement>(
                'li',
                {
                    children: ['Item 2']
                }
            ).dom
        ]
    }
);
```

### Keyed diffing

When rendering dynamic collections, assign a unique `key` to each element:

```typescript
const item = new Element<HTMLLIElement>(
    'li',
    {
        key: 'todo-1',
        children: ['Learn Nuvo']
    }
);
```

Nuvo uses keys to identify and reconcile existing DOM elements.

The keyed diffing process:

- **Reuse** — Reuses existing DOM elements with matching keys.
- **Remove** — Removes elements whose keys no longer exist.
- **Insert** — Inserts newly created elements.
- **Reorder** — Moves existing DOM elements when their order changes.

### Example: reactive todo list

```typescript
import { Element, Store } from '@nuvo-js/core';

interface Todo {
    id: string;
    title: string;
}

const todos = new Store<Todo[]>([]);

const list = new Element<HTMLOListElement>(
    'ol',
    {
        children: []
    }
);

todos.Effect((state) => {
    list.SetProps({
        children: state.map(todo =>
            new Element<HTMLLIElement>(
                'li',
                {
                    key: todo.id,
                    children: [todo.title]
                }
            ).dom
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

### Key best practices

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

Inspired by the Italian word *nuovo* and the French word *nouveau*, both meaning new, fresh, or recently developed, the name reflects Nuvo's vision of bringing a fresh, simple, and modern approach to building web interfaces.

Build with JavaScript. Control the DOM. Keep things simple.

**Nuvo — A fresh approach to the DOM.**

## License

MIT
