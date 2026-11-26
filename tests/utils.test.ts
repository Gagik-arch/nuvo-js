
import {
    describe,
    it,
    expect,
    beforeEach
} from 'vitest';

import {
    isNotEqualProps,
    setupChildren,
    isWritableDOMProperty,
    isNotEqualTagName
} from '../src/Element/utils';

import { Element } from '../src'
import type { ElementPropsType } from '../src/types'
import type { DOMElement } from '../src/Element/types'

// Helpers
function createElement(
    tagName: keyof HTMLElementTagNameMap = 'div',
    props?: ElementPropsType
): DOMElement {
    return new Element(tagName, props).dom;
}

function createKeyedElement(
    key: string | number | undefined,
    tagName: keyof HTMLElementTagNameMap = 'div',
    props?: ElementPropsType
): DOMElement {
    return new Element(tagName, {
        ...props,
        key
    }).dom;
}

describe('Element utilities', () => {
    let root: HTMLElement;

    beforeEach(() => {
        root = document.createElement('div');
    });

    // --------------------------------------------------
    // isNotEqualTagName
    // --------------------------------------------------

    describe('isNotEqualTagName', () => { 
          it('should return false when tag names are different', () => {
            const oldNode = createElement('div');
            const newNode = createElement('span');

            expect(isNotEqualTagName(oldNode, newNode)).toBe(true);
        });
    })

    // --------------------------------------------------
    // isNotEqualProps
    // --------------------------------------------------
    describe('isNotEqualProps', () => {
        it('should return false when old node is null', () => {
            const newNode = createElement();

            expect(isNotEqualProps(null, newNode)).toBe(false);
        });

        it('should return false when new node is null', () => {
            const oldNode = createElement();

            expect(isNotEqualProps(oldNode, null)).toBe(false);
        });

        it('should return false when both nodes are null', () => {
            expect(isNotEqualProps(null, null)).toBe(false);
        });

        it('should return false when attributes are identical', () => {
            const oldNode = createElement('div', {
                id: 'test',
                className: 'container'
            });

            const newNode = createElement('div', {
                id: 'test',
                className: 'container'
            });

            expect(isNotEqualProps(oldNode, newNode)).toBe(false);
        });

        it('should return true when an attribute value changes', () => {
            const oldNode = createElement('div', {
                id: 'old'
            });

            const newNode = createElement('div', {
                id: 'new'
            });

            expect(isNotEqualProps(oldNode, newNode)).toBe(true);
        });

        it('should return false when attribute counts differ', () => {
            const oldNode = createElement('div', {
                id: 'test'
            });

            const newNode = createElement('div', {
                id: 'test',
                className: 'container'
            });

            expect(isNotEqualProps(oldNode, newNode)).toBe(true);
        });
    });

    // --------------------------------------------------
    // setupChildren - force update
    // --------------------------------------------------

    describe('setupChildren', () => {
        describe('Force update', () => {
            it('should replace all existing children', () => {
                root.append(
                    createElement('div', { children: ['Old'] },),
                    createElement('span', { children: ['Old'] })
                );

                const first = createElement('p', { children: ['First'] });
                const second = createElement('p', { children: ['Second'] },);

                setupChildren(
                    [first, second],
                    root,
                    true
                );

                expect(root.children).toHaveLength(2);
                expect(root.children[0]).toBe(first);
                expect(root.children[1]).toBe(second);
            });

            it('should remove existing children when given an empty array', () => {
                root.appendChild(createElement());

                setupChildren([], root, true);

                expect(root.childNodes).toHaveLength(0);
            });

            it('should support an undefined children argument', () => {
                root.appendChild(createElement());

                setupChildren(undefined, root, true);

                expect(root.children).toHaveLength(1);
            });
        });

        // --------------------------------------------------
        // Unkeyed diff
        // --------------------------------------------------

        describe('Unkeyed diff', () => {
            it('should append new children', () => {
                const first = createElement('div', { children: ['First'] });
                const second = createElement('span', { children: ['Second'] });

                setupChildren([first, second], root, false);

                expect(root.children).toHaveLength(2);
                expect(root.children[0]).toBe(first);
                expect(root.children[1]).toBe(second);
            });

            it('should remove excess children', () => {
                root.append(
                    createElement('div'),
                    createElement('span'),
                    createElement('p')
                );

                const newChild = createElement('section');

                setupChildren([newChild], root, false);

                expect(root.children).toHaveLength(1);
                expect(root.firstElementChild).toBe(newChild);
            });

            it('should replace a child when its tag name changes', () => {
                const oldChild = createElement('div', { children: ['Content'] });

                root.appendChild(oldChild);

                const newChild = createElement('span', { children: ['Content'] });

                setupChildren([newChild], root, false);

                expect(root.firstElementChild).toBe(newChild);
                expect(root.firstElementChild?.tagName).toBe('SPAN');
            });

            it('should replace a child when its innerHTML changes', () => {
                const oldChild = createElement('div', { children: ['Old'] });

                root.appendChild(oldChild);

                const newChild = createElement('div', { children: ['New'] },);

                setupChildren([newChild], root, false);

                expect(root.firstElementChild).toBe(newChild);
                expect(root.textContent).toBe('New');
            });

            it('should not replace children when their content and attributes are unchanged', () => {
                const oldChild = createElement(
                    'div',
                    { id: 'test', children: ['Content'] },

                );

                root.appendChild(oldChild);

                const newChild = createElement(
                    'div',
                    { id: 'test', children: ['Content'] },
                );

                setupChildren([newChild], root, false);

                expect(root.firstElementChild).toBe(oldChild);
            });

            it('should support empty children', () => {
                setupChildren([], root, false);

                expect(root.childNodes).toHaveLength(0);
            });
        });

        // --------------------------------------------------
        // Keyed diff
        // --------------------------------------------------

        describe('Keyed diff', () => {
            it('should insert new keyed children', () => {
                const first = createKeyedElement('1');
                const second = createKeyedElement('2');

                setupChildren([first, second], root, false);

                expect(root.children).toHaveLength(2);
                expect(root.children[0]).toBe(first);
                expect(root.children[1]).toBe(second);
            });

            it('should remove children whose keys no longer exist', () => {
                const first = createKeyedElement('1');
                const second = createKeyedElement('2');

                root.append(first, second);

                const updatedFirst = createKeyedElement('1');

                setupChildren([updatedFirst], root, false);

                expect(root.children).toHaveLength(1);
                expect(root.firstElementChild).toBe(first);
            });

            it('should preserve existing DOM elements when reordering', () => {
                const first = createKeyedElement('1');
                const second = createKeyedElement('2');
                const third = createKeyedElement('3');

                root.append(first, second, third);

                const newChildren = [
                    createKeyedElement('3'),
                    createKeyedElement('1'),
                    createKeyedElement('2')
                ];

                setupChildren(newChildren, root, false);

                expect(Array.from(root.children)).toEqual([
                    third,
                    first,
                    second
                ]);
            });

            it('should insert new children without replacing existing ones', () => {
                const first = createKeyedElement('1');
                const second = createKeyedElement('2');

                root.append(first, second);

                const newChild = createKeyedElement('3');

                setupChildren([
                    createKeyedElement('1'),
                    newChild,
                    createKeyedElement('2')
                ], root, false);

                expect(Array.from(root.children)).toEqual([
                    first,
                    newChild,
                    second
                ]);
            });

            it('should throw when only some children have keys', () => {
                const first = createKeyedElement('1');
                const second = createElement();

                expect(() => {
                    setupChildren([first, second], root, false);
                }).toThrow(
                    'Nuvo: All sibling elements must have a key when using keyed diffing.'
                );
            });

            it('should throw when sibling keys are duplicated', () => {
                const first = createKeyedElement('1');
                const second = createKeyedElement('1');

                expect(() => {
                    setupChildren([first, second], root, false);
                }).toThrow(
                    'Nuvo: Duplicate keys detected among sibling elements.'
                );
            });

            it('should support numeric keys', () => {
                const first = createKeyedElement(1);
                const second = createKeyedElement(2);

                setupChildren([first, second], root, false);

                expect(root.children).toHaveLength(2);
            });
        });

        // --------------------------------------------------
        // Children callback
        // --------------------------------------------------

        describe('Children callback', () => {
            it('should pass existing child nodes to the callback', () => {
                const first = createElement('div');
                const second = createElement('span');

                root.append(first, second);

                setupChildren(
                    (childNodes) => {
                        expect(childNodes).toBeInstanceOf(Set);
                        expect(childNodes.has(first)).toBe(true);
                        expect(childNodes.has(second)).toBe(true);

                        return new Set(childNodes);
                    },
                    root,
                    false
                );

                expect(root.children).toHaveLength(2);
            });

            it('should use the returned Set as the new children', () => {
                const first = createElement('div');
                const second = createElement('span');

                root.append(first, second);

                const replacement = createElement('p');

                setupChildren(
                    () => new Set([replacement]),
                    root,
                    false
                );

                expect(root.children).toHaveLength(1);
                expect(root.firstElementChild).toBe(replacement);

                expect(first.isConnected).toBe(false);
                expect(second.isConnected).toBe(false);
            });

            it('should support an empty Set returned by the callback', () => {
                root.appendChild(createElement());

                setupChildren(
                    () => new Set(),
                    root,
                    false
                );

                expect(root.childNodes).toHaveLength(0);
            });
        });
    });

    // --------------------------------------------------
    // isWritableDOMProperty
    // --------------------------------------------------

    describe('isWritableDOMProperty', () => {
        it('should return true for writable input value', () => {
            const input = document.createElement('input');

            expect(
                isWritableDOMProperty(input, 'value')
            ).toBe(true);
        });

        it('should return true for writable input checked', () => {
            const input = document.createElement('input');

            expect(
                isWritableDOMProperty(input, 'checked')
            ).toBe(true);
        });

        it('should return true for writable innerHTML', () => {
            expect(
                isWritableDOMProperty(root, 'innerHTML')
            ).toBe(true);
        });

        it('should return false for readonly tagName', () => {
            expect(
                isWritableDOMProperty(root, 'tagName')
            ).toBe(false);
        });

        it('should return false for a nonexistent property', () => {
            expect(
                isWritableDOMProperty(root, 'nonexistentProperty')
            ).toBe(false);
        });

        it('should detect writable inherited properties', () => {
            class CustomElement extends HTMLElement {
                private _customValue = 'test';

                public get customValue(): string {
                    return this._customValue;
                }

                public set customValue(value: string) {
                    this._customValue = value;
                }
            }

            const element = document.createElement('div');

            Object.setPrototypeOf(
                element,
                CustomElement.prototype
            );

            expect(
                isWritableDOMProperty(element, 'customValue')
            ).toBe(true);
        });

        it('should return false for readonly custom properties', () => {
            const element = document.createElement('div');

            Object.defineProperty(element, 'readonlyValue', {
                value: 'test',
                writable: false
            });

            expect(
                isWritableDOMProperty(element, 'readonlyValue')
            ).toBe(false);
        });

        it('should return true for writable custom properties', () => {
            const element = document.createElement('div');

            Object.defineProperty(element, 'customValue', {
                value: 'test',
                writable: true
            });

            expect(
                isWritableDOMProperty(element, 'customValue')
            ).toBe(true);
        });
    });
});
