import { setupChildren } from '../Element/utils';
import {
    setupClassName, setupStyle
} from '../helpers';
import type {
    SVGTags, SVGElementPropsType, HTMLSVGTags
} from './types';

const svgNS = 'http://www.w3.org/2000/svg';

class SVGElement<T extends SVGTags> {
    public dom: T;
    public key?: string | number | undefined = undefined;

    public constructor(
        tagName: HTMLSVGTags,
        props?: SVGElementPropsType<T>,
        rootElement?: HTMLElement,
    ) {
        this.dom = document.createElementNS(svgNS, tagName) as T;

        if (rootElement) {
            rootElement.appendChild(this.dom);
        }

        this.SetProps(props );
    }

    public SetProps(
        props: SVGElementPropsType<T> | undefined,
        isForceUpdate = false
    ) {

        const {
            className,
            children,
            style,
            ..._props
        } = props ?? {}

        if (className !== undefined) {
            setupClassName(
                className,
                this.dom
            );
        }

        if (style !== undefined) {
            setupStyle(
                style as CSSStyleDeclaration,
                this.dom
            );
        }

        if (children !== undefined) {
            setupChildren(
                children,
                this.dom,
                isForceUpdate
            );
        }

        Object.entries(_props)
            .forEach(([
                name,
                value
            ]) => {
                this.dom.setAttribute(name, value as string);
            });

        return this;
    }

    public Destroy() {
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

export type { SVGElementPropsType };

export default SVGElement;
