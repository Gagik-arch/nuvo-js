import { mergeAttributes, mergeEvents } from '../utils';
import type {
    Children, DOMElement, VirtualHTMLElement
} from './types';

function hasKeyedChildren(
    children: DOMElement[]
): boolean {
    const keys = children.map(
        child => (child as VirtualHTMLElement).__key
    );

    const hasKeys = keys.some(
        key => key !== undefined && key !== null
    );

    if (!hasKeys) {
        return false;
    }

    const hasMissingKeys = keys.some(
        key => key === undefined || key === null
    );

    if (hasMissingKeys) {
        throw new Error(
            'Nuvo: All sibling elements must have a key when using keyed diffing.'
        );
    }

    const uniqueKeys = new Set(keys);

    if (uniqueKeys.size !== keys.length) {
        throw new Error(
            'Nuvo: Duplicate keys detected among sibling elements.'
        );
    }

    return true;
}

export function compareProps(
    oldNode: DOMElement | null,
    newNode: DOMElement | null
) {
    if (!oldNode || !newNode) return false;

    const oldNAttrs = oldNode.attributes;
    const newNAttrs = newNode.attributes;

    if (oldNode.tagName !== newNode.tagName) return false;

    if (oldNAttrs.length !== newNAttrs.length) return false;

    for (const attr of oldNAttrs) {
        if (newNode.getAttribute(attr.name) !== attr.value) {
            return true;
        }
    }

    return false;
}

function keyedDiff(
    dom: DOMElement,
    newChildren: VirtualHTMLElement[]
) {
    const oldChildren = Array.from(dom.children) as VirtualHTMLElement[];

    const oldByKey = new Map(oldChildren.map(child => [
        child.__key,
        child
    ]));

    const newKeys = new Set(
        newChildren.map(child => child.__key)
    );

    for (const child of oldChildren) {
        if (!newKeys.has(child.__key)) {
            child.remove();
        }
    }

    let anchor: Element | null = dom.firstElementChild;

    for (const newChild of newChildren) {
        let current = oldByKey.get(newChild.__key);

        if (!current) {
            dom.insertBefore(newChild, anchor);
            anchor = newChild.nextElementSibling;
            continue;
        }

        if (current.tagName !== newChild.tagName) {
            current.replaceWith(newChild);
            oldByKey.set(newChild.__key, newChild);
            current = newChild;
        } else if (compareProps(current, newChild)) {
            mergeAttributes(current, newChild);
            mergeEvents(current, newChild.__events)
        }

        if (current !== anchor) {
            dom.insertBefore(current, anchor);
        }

        anchor = current.nextElementSibling;
    }
}

function unKeyedDiff(dom: DOMElement, newChildren: DOMElement[]) {
    const oldChildren = Array.from(dom.childNodes);

    const max = Math.max(oldChildren.length, newChildren.length);

    for (let i = 0; i < max; i++) {
        const oldNode = oldChildren[i] as DOMElement | undefined;
        const newNode = newChildren[i] as DOMElement | undefined;

        let shouldReplace;

        if (oldNode?.nodeType === Node.ELEMENT_NODE && newNode?.nodeType === Node.ELEMENT_NODE) {
            shouldReplace = compareProps(oldNode, newNode) || oldNode.innerHTML !== newNode.innerHTML;
        } else {
            shouldReplace = oldNode !== newNode;
        }

        if (!oldNode && newNode) {
            dom.append(newNode);
        } else if (oldNode && !newNode) {
            dom.removeChild(oldNode);
        } else if (oldNode && newNode && shouldReplace) {
            oldNode.replaceWith(newNode);
        }
    }
}

export function setupChildren<T extends DOMElement>(
    children: ((childNodes: Set<ChildNode>) => Set<ChildNode>) | Children[] | undefined,
    dom: T,
    isForceUpdate: boolean
) {
    if (children) {
        const newChildren
            = typeof children === 'function'
                ? Array.from(children(new Set(dom.childNodes)))
                : children;

        const extracted = newChildren.filter(Boolean) as VirtualHTMLElement[];

        if (isForceUpdate) {
            dom.replaceChildren(...extracted);
        } else {
            const diffMode = hasKeyedChildren(extracted as VirtualHTMLElement[]);

            if (diffMode) {
                keyedDiff(dom, extracted);
            } else {
                unKeyedDiff(dom, extracted);
            }
        }
    }
}

export function isWritableDOMProperty(
    element: HTMLElement,
    name: string
): boolean {
    let current: object | null = element;

    while (current) {
        const descriptor = Object.getOwnPropertyDescriptor(
            current,
            name
        );

        if (descriptor) {
            // Accessor property
            if (descriptor.get || descriptor.set) {
                return typeof descriptor.set === 'function';
            }

            // Data property
            return descriptor.writable === true;
        }

        current = Object.getPrototypeOf(current);
    }

    return false;
}