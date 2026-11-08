import type {
    ElementPropsType, ElementConstructorType, HTMLElementTags, EventType, VirtualHTMLElement
} from './types';
import {
    isPlainObject, setupClassName, setupStyle
} from '../utils';
import { isWritableDOMProperty, setupChildren } from './utils';

class Element<T extends HTMLElementTags> {
    public dom: T;
    private controller = new AbortController();

    public constructor({
        tagName,
        props: {
            children,
            className,
            style,
            events,
            key,
            ...props
        },
        rootElement,
    }: ElementConstructorType<T>) {
        this.dom = document.createElement(tagName) as T;

        const virtualDom = this.dom as VirtualHTMLElement;

        if (key) {
            virtualDom.__key = key;
        }

        if (rootElement) {
            rootElement.appendChild(this.dom);
        }

        this.SetProps(
            {
                className,
                children,
                style,
                ...props,
            } as Omit<ElementPropsType<T>, 'className'> & {
                className?: ((classList: DOMTokenList) => void) | string | undefined;
            }
        );

        this.SetEvents(events);
    }

    public SetProps(
        {
            className,
            children,
            style,
            ...props
        }: Omit<ElementPropsType<T>, 'className'> & {
            className?: ((classList: DOMTokenList) => void) | string | undefined;
        },
        isForceUpdate = false
    ) {
        if (className !== undefined) {
            setupClassName(className, this.dom);
        }

        if (style !== undefined) {
            setupStyle(style, this.dom);
        }

        if (children !== undefined) {
            if (!Array.isArray(children)) {
                throw new Error('Nuvo: Children must be an array.');
            }

            setupChildren(children, this.dom, isForceUpdate);
        }

        Object.entries(props).forEach(([name, value]) => {
            if (name === 'events' || isPlainObject(value)) return;

            // Input and textarea current value ->
            if (
                name === 'value' &&
                (
                    this.dom instanceof HTMLInputElement ||
                    this.dom instanceof HTMLTextAreaElement ||
                    this.dom instanceof HTMLSelectElement
                )
            ) {
                const nextValue = value == null ? '' : String(value);

                if (!value == null || value === undefined) {
                    this.dom.removeAttribute('value');
                } else {
                    this.dom.setAttribute('value', nextValue);
                }

                if (this.dom.value !== nextValue) {
                    this.dom.value = nextValue;
                    this.dom.setAttribute('value', nextValue);
                }

                return;
            }
            // <- Input and textarea current value

            // HTML attributes ->
            if (value == null || value === '') {
                this.dom.removeAttribute(name);
                return;
            }
            // <- HTML attributes

            // Native DOM properties ->
            if (
                name in this.dom &&
                isWritableDOMProperty(this.dom, name)
            ) {
                if (value === undefined || value === undefined) {
                    this.dom.removeAttribute(name);
                    return
                };

                const currentValue = (this.dom as any)[name];

                if (currentValue !== value) {
                    (this.dom as any)[name] = value;
                }

                return;
            }
            // Native DOM properties <-

            const nextValue = String(value);

            if (this.dom.getAttribute(name) !== nextValue) {
                this.dom.setAttribute(name, nextValue);
            }
        });

        return this;
    }

    public SetEvents(events: EventType<T> | undefined) {
        this.controller.abort();
        this.controller = new AbortController();

        if (!events) {
            (this.dom as VirtualHTMLElement).__events = {};
            return this;
        }

        Object.entries<EventType<T>[keyof EventType<T>]>(events)
            .forEach(([type, listener]) => {
                this.dom.addEventListener(
                    type.replace(/^on/, ''),
                    listener as EventListener,
                    { signal: this.controller.signal }
                );
            });

        (this.dom as VirtualHTMLElement<T>).__events = events;

        return this;
    }

    public Destroy() {
        this.controller.abort('Element event is destroyed.');

        this.Remove();
    }

    public Remove() {
        this.dom.remove();
    }

    public OnMount(callback: (e: this) => void) {
        if (this.dom.isConnected) {
            callback(this);
            return this;
        }
        const observer = new MutationObserver(() => {
            if (this.dom.isConnected) {
                callback(this);
                observer.disconnect();
            }
        });

        observer.observe(document, {
            childList: true,
            subtree: true,
        });

        return this;
    }

    public OnUnMount(callback: (e: this) => void) {
        const observer = new MutationObserver(() => {
            if (!this.dom.isConnected) {
                callback(this);

                this.Destroy();
                observer.disconnect();
            }
        });

        observer.observe(document, {
            childList: true,
            subtree: true,
        });

        return this;
    }
}

export type { ElementPropsType };

export default Element;
