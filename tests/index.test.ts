
import { describe, it, expect, beforeEach } from 'vitest';

import nuvojs, {
    Element,
    Store,
    Fragment,
    SVGElement,
    createRoot
} from '../src';

describe('Nuvo.js entry point', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('Exports', () => {
        it('should export all public APIs', () => {
            expect(Element).toBeDefined();
            expect(Store).toBeDefined();
            expect(Fragment).toBeDefined();
            expect(SVGElement).toBeDefined();
            expect(createRoot).toBeDefined();
        });

        it('should expose all APIs through default export', () => {
            expect(nuvojs).toEqual({
                Element,
                Store,
                Fragment,
                SVGElement,
                createRoot
            });
        });

        it('should expose the same references in named and default exports', () => {
            expect(nuvojs.Element).toBe(Element);
            expect(nuvojs.Store).toBe(Store);
            expect(nuvojs.Fragment).toBe(Fragment);
            expect(nuvojs.SVGElement).toBe(SVGElement);
            expect(nuvojs.createRoot).toBe(createRoot);
        });
    });

    describe('Global registration', () => {
        it('should register Nuvo.js on window', () => {
            expect(window['nuvojs']).toBeDefined();
            expect(window['nuvojs']).toBe(nuvojs);
        });

        it('should expose all APIs globally', () => {
            const globalAPI = window['nuvojs'];

            expect(globalAPI.Element).toBe(Element);
            expect(globalAPI.Store).toBe(Store);
            expect(globalAPI.Fragment).toBe(Fragment);
            expect(globalAPI.SVGElement).toBe(SVGElement);
            expect(globalAPI.createRoot).toBe(createRoot);
        });

        it('should define the global property as non-configurable', () => {
            const descriptor = Object.getOwnPropertyDescriptor(
                window,
                'nuvojs'
            );

            expect(descriptor?.configurable).toBe(false);
        });

        it('should define the global property as non-enumerable', () => {
            const descriptor = Object.getOwnPropertyDescriptor(
                window,
                'nuvojs'
            );

            expect(descriptor?.enumerable).toBe(false);
        });
    });

    describe('createRoot', () => {
        let root: HTMLElement;

        beforeEach(() => {
            root = document.createElement('div');
        });

        it('should append an array of elements', () => {
            const first = document.createElement('div');
            const second = document.createElement('span');

            createRoot(root, [first, second]);

            expect(root.children).toHaveLength(2);
            expect(root.children[0]).toBe(first);
            expect(root.children[1]).toBe(second);
        });

        it('should append an array of strings and elements', () => {
            const element = document.createElement('span');

            createRoot(root, ['Hello ', element, ' World']);

            expect(root.textContent).toBe('Hello  World');
            expect(root.children[0]).toBe(element);
        });

        it('should append a DocumentFragment', () => {
            const fragment = document.createDocumentFragment();

            const first = document.createElement('div');
            const second = document.createElement('span');

            fragment.append(first, second);

            createRoot(root, fragment);

            expect(root.children).toHaveLength(2);
            expect(root.children[0]).toBe(first);
            expect(root.children[1]).toBe(second);
        });

        it('should move elements from their original parent', () => {
            const originalParent = document.createElement('div');
            const element = document.createElement('span');

            originalParent.appendChild(element);

            createRoot(root, [element]);

            expect(originalParent.children).toHaveLength(0);
            expect(root.firstElementChild).toBe(element);
        });

        it('should support an empty array', () => {
            createRoot(root, []);

            expect(root.children).toHaveLength(0);
            expect(root.childNodes).toHaveLength(0);
        });

        it('should support an empty DocumentFragment', () => {
            const fragment = document.createDocumentFragment();

            createRoot(root, fragment);

            expect(root.children).toHaveLength(0);
            expect(root.childNodes).toHaveLength(0);
        });
    });
});
