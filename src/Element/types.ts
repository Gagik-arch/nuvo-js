type Handlers = Omit<GlobalEventHandlers, 'addEventListener' | 'removeEventListener'>;
type Nullable<T> = {
    [K in keyof T]: T[K] | null;
};

export type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

export type NodeChildren = string | ChildNode | undefined | null;
export type DOMElement = HTMLElement | SVGElement;

export type Dataset = Record<`data-${string}`, string>;
export type HTMLTags = keyof HTMLElementTagNameMap;

export type HTMLElementTags = HTMLElementTagNameMap[HTMLTags];

export type Children = NodeChildren | DocumentFragment | HTMLElement;

export type EventType<T extends Element> = {
    [K in keyof Handlers]?: Handlers[K] extends ((this: T, ev: infer E) => void) | null
    ? (ev: E) => void
    : never;
};

export type ElementPropsType<T extends HTMLElementTags = HTMLElement>
    =
    & Partial<Omit<Pick<T, NonFunctionPropertyNames<T>>, 'children' | 'className' | 'style'>>
    & Omit<Nullable<Partial<T>>, 'children' | 'className' | 'style'>
    & Dataset
    & {
        children?: Children[];
        className?: ((classList: DOMTokenList) => void) | string;
        style?: Partial<HTMLElement['style']>;
        events?: EventType<T>;
        key?: string;
    };

export type VirtualHTMLElement<T extends HTMLElementTags = HTMLElement> = DOMElement & {
    __key?: string;
    __events: EventType<T>;
    __eventController: AbortController;
};

