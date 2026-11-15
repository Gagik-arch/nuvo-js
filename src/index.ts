import './global';

import Element from './Element';
import Fragment from './Fragment';
import Store from './store';
import SVGElement from './SVGElement';

const createRoot = (
    rootElement: HTMLElement,
    app: (string | HTMLElement | DocumentFragment)[] | DocumentFragment
): void => {
    if (Array.isArray(app)) {
        rootElement.append(...app);
    } else {
        rootElement.appendChild(app);
    }
};

 const nuvojs = {
    Element,
    Store,
    Fragment,
    SVGElement,
    createRoot
} as const 


if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'nuvo-js', {
        value: Object.freeze(nuvojs),
        writable: false,
        configurable: false,
        enumerable: false
    });
}

export {
    Element,
    Store,
    Fragment,
    SVGElement,
    createRoot
};

export default nuvojs

