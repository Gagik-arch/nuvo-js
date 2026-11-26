
import {
    describe,
    it,
    expect,
    vi,
    beforeEach
} from 'vitest';

import {
    camelToKebab,
    setupClassName,
    setupStyle,
    isPlainObject,
    isEqualObjects,
    mergeAttributes,
    mergeEvents
} from '../src/helpers';
import { Element } from '../src';
import type {
    VirtualHTMLElement
} from '../src/Element/types';

// Helpers
function createNuvoElement(
    tagName: keyof HTMLElementTagNameMap = 'div',
): VirtualHTMLElement {
    const element = new Element(tagName);

    return element.dom as VirtualHTMLElement;
}

describe('Utils', () => {

    // --------------------------------------------------
    // camelToKebab
    // --------------------------------------------------

    describe('camelToKebab', () => {
        it('converts camelCase to kebab-case', () => {
            expect(camelToKebab('backgroundColor')).toBe('background-color');
            expect(camelToKebab('marginTop')).toBe('margin-top');
        });

        it('returns the same string when no uppercase letters exist', () => {
            expect(camelToKebab('color')).toBe('color');
        });

        it('handles multiple uppercase letters', () => {
            expect(camelToKebab('WebkitTransform')).toBe('-webkit-transform');
        });

        it('handles an empty string', () => {
            expect(camelToKebab('')).toBe('');
        });
    });

    // --------------------------------------------------
    // setupClassName
    // --------------------------------------------------

    describe('setupClassName', () => {
        let dom: HTMLDivElement;

        beforeEach(() => {
            dom = document.createElement('div');
        });

        it('does nothing when DOM element is undefined', () => {
            expect(() => setupClassName('active', undefined)).not.toThrow();
        });

        it('does nothing when className is undefined', () => {
            setupClassName(undefined, dom);

            expect(dom.className).toBe('');
        });

        it('does nothing when className is empty', () => {
            dom.className = 'existing';

            setupClassName('', dom);

            expect(dom.className).toBe('existing');
        });

        it('sets a string className', () => {
            setupClassName('active selected', dom);

            expect(dom.className).toBe('active selected');
        });

        it('does not update an unchanged className', () => {
            dom.className = 'active';

            const spy = vi.spyOn(dom.classList, 'add');

            setupClassName('active', dom);

            expect(spy).not.toHaveBeenCalled();
        });

        it('supports callback-based className updates', () => {
            const callback = vi.fn((classList: DOMTokenList) => {
                classList.add('active');
                classList.add('selected');
            });

            setupClassName(callback, dom);

            expect(callback).toHaveBeenCalledWith(dom.classList);
            expect(dom.classList.contains('active')).toBe(true);
            expect(dom.classList.contains('selected')).toBe(true);
        });
    });

    // --------------------------------------------------
    // setupStyle
    // --------------------------------------------------

    describe('setupStyle', () => {
        let dom: HTMLDivElement;

        beforeEach(() => {
            dom = document.createElement('div');
        });

        it('does nothing when style is undefined', () => {
            setupStyle(undefined, dom);

            expect(dom.getAttribute('style')).toBeNull();
        });

        it('does nothing when style is empty', () => {
            setupStyle({}, dom);

            expect(dom.getAttribute('style')).toBeNull();
        });

        it('does nothing when DOM element is undefined', () => {
            expect(() => setupStyle({
                backgroundColor: 'red'
            }, undefined)).not.toThrow();
        });

        it('sets CSS properties', () => {
            setupStyle({
                backgroundColor: 'red',
                marginTop: '10px',
                padding: '5px'
            }, dom);

            expect(dom.style.backgroundColor).toBe('red');
            expect(dom.style.marginTop).toBe('10px');
            expect(dom.style.padding).toBe('5px');
        });

        it('ignores falsy style values', () => {
            setupStyle({
                backgroundColor: '',
                marginTop: null as any,
                padding: undefined as any
            }, dom);

            expect(dom.style.backgroundColor).toBe('');
            expect(dom.style.marginTop).toBe('');
            expect(dom.style.padding).toBe('');
        });
    });

    // --------------------------------------------------
    // isPlainObject
    // --------------------------------------------------

    describe('isPlainObject', () => {
        it('returns true for ordinary objects', () => {
            expect(isPlainObject({})).toBe(true);
            expect(isPlainObject({ name: 'Nuvo' })).toBe(true);
        });

        it('returns true for objects with null prototypes', () => {
            const object = Object.create(null);

            expect(isPlainObject(object)).toBe(true);
        });

        it('returns false for null', () => {
            expect(isPlainObject(null)).toBe(false);
        });

        it('returns false for primitive values', () => {
            expect(isPlainObject('Nuvo')).toBe(false);
            expect(isPlainObject(123)).toBe(false);
            expect(isPlainObject(true)).toBe(false);
            expect(isPlainObject(undefined)).toBe(false);
        });

        it('returns false for arrays', () => {
            expect(isPlainObject([])).toBe(false);
        });

        it('returns false for Date instances', () => {
            expect(isPlainObject(new Date())).toBe(false);
        });

        it('returns false for class instances', () => {
            class CustomClass { }

            expect(isPlainObject(new CustomClass())).toBe(false);
        });
    });

    // --------------------------------------------------
    // isEqualObjects
    // --------------------------------------------------

    describe('isEqualObjects', () => {
        it('returns true for identical primitive values', () => {
            expect(isEqualObjects(1, 1)).toBe(true);
            expect(isEqualObjects('Nuvo', 'Nuvo')).toBe(true);
            expect(isEqualObjects(null, null)).toBe(true);
            expect(isEqualObjects(undefined, undefined)).toBe(true);
        });

        it('handles NaN and signed zero correctly', () => {
            expect(isEqualObjects(NaN, NaN)).toBe(true);
            expect(isEqualObjects(0, -0)).toBe(false);
        });

        it('returns false for different primitive values', () => {
            expect(isEqualObjects(1, 2)).toBe(false);
            expect(isEqualObjects('a', 'b')).toBe(false);
        });

        it('compares arrays', () => {
            expect(isEqualObjects([1, 2, 3], [1, 2, 3])).toBe(true);
            expect(isEqualObjects([1, 2], [1, 2, 3])).toBe(false);
            expect(isEqualObjects([1, 2], [1, 3])).toBe(false);
        });

        it('compares nested arrays', () => {
            expect(
                isEqualObjects(
                    [1, [2, 3]],
                    [1, [2, 3]]
                )
            ).toBe(true);
        });

        it('compares plain objects', () => {
            expect(
                isEqualObjects(
                    { name: 'Nuvo', version: 1 },
                    { name: 'Nuvo', version: 1 }
                )
            ).toBe(true);
        });

        it('compares nested objects', () => {
            expect(
                isEqualObjects(
                    { config: { enabled: true } },
                    { config: { enabled: true } }
                )
            ).toBe(true);
        });

        it('returns false when object keys differ', () => {
            expect(
                isEqualObjects(
                    { name: 'Nuvo' },
                    { version: 1 }
                )
            ).toBe(false);
        });

        it('returns false when object values differ', () => {
            expect(
                isEqualObjects(
                    { name: 'Nuvo' },
                    { name: 'React' }
                )
            ).toBe(false);
        });

        it('compares objects with different key order', () => {
            expect(
                isEqualObjects(
                    { a: 1, b: 2 },
                    { b: 2, a: 1 }
                )
            ).toBe(true);
        });

        it('compares objects with symbol keys', () => {
            const key = Symbol('key');

            expect(
                isEqualObjects(
                    { [key]: 1 },
                    { [key]: 1 }
                )
            ).toBe(true);
        });

        it('returns false for different object types', () => {
            expect(isEqualObjects({}, [])).toBe(false);
            expect(isEqualObjects([], {})).toBe(false);
            expect(isEqualObjects(new Date(), new Date())).toBe(false);
        });

        it('compares objects with null prototypes', () => {
            const first = Object.assign(Object.create(null), {
                value: 1
            });

            const second = Object.assign(Object.create(null), {
                value: 1
            });

            expect(isEqualObjects(first, second)).toBe(true);
        });
    });

    // --------------------------------------------------
    // mergeAttributes
    // --------------------------------------------------

    describe('mergeAttributes', () => {
        it('updates changed attributes', () => {
            const oldChild = createNuvoElement();
            const newChild = createNuvoElement();

            oldChild.setAttribute('id', 'old');
            newChild.setAttribute('id', 'new');

            mergeAttributes(oldChild, newChild);

            expect(oldChild.getAttribute('id')).toBe('new');
        });

        it('does nothing when attribute values are identical', () => {
            const oldChild = createNuvoElement();
            const newChild = createNuvoElement();

            oldChild.setAttribute('id', 'same');
            newChild.setAttribute('id', 'same');

            mergeAttributes(oldChild, newChild);

            expect(oldChild.getAttribute('id')).toBe('same');
        });

        it('does nothing when attribute names differ at the same index', () => {
            const oldChild = createNuvoElement();
            const newChild = createNuvoElement();

            oldChild.setAttribute('class', 'old');

            newChild.setAttribute('class', 'old');
            newChild.setAttribute('title', 'new');

            mergeAttributes(oldChild, newChild);

            expect(oldChild.hasAttribute('class')).toBe(true);
            expect(oldChild.hasAttribute('title')).toBe(true);
        });

        it('handles elements without attributes', () => {
            const oldChild = createNuvoElement();
            const newChild = createNuvoElement();

            expect(() => mergeAttributes(oldChild, newChild)).not.toThrow();
        });

        it('updates event handlers when an attribute changes', () => {
            const oldChild = createNuvoElement();
            const newChild = createNuvoElement();

            const oldHandler = vi.fn();
            const newHandler = vi.fn();

            oldChild.setAttribute('id', 'old');
            newChild.setAttribute('id', 'new');

            mergeEvents(oldChild, {
                onclick: oldHandler
            });

            newChild.__events = {
                onclick: newHandler
            };

            mergeAttributes(oldChild, newChild);

            (oldChild as HTMLElement).click();

            expect(oldHandler).not.toHaveBeenCalled();
            expect(newHandler).toHaveBeenCalledTimes(1);
        });
    });

    // --------------------------------------------------
    // mergeEvents
    // --------------------------------------------------

    describe('mergeEvents', () => {
        it('registers event handlers', () => {
            const dom = createNuvoElement();
            const onClick = vi.fn();

            mergeEvents(dom, {
                onclick: onClick
            });

            (dom as HTMLElement).click();

            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it('removes previous event handlers', () => {
            const dom = createNuvoElement();

            const oldHandler = vi.fn();
            const newHandler = vi.fn();

            mergeEvents(dom, {
                onclick: oldHandler
            });

            mergeEvents(dom, {
                onclick: newHandler
            });

            (dom as HTMLElement).click();

            expect(oldHandler).not.toHaveBeenCalled();
            expect(newHandler).toHaveBeenCalledTimes(1);
        });

        it('supports undefined events', () => {
            const dom = createNuvoElement();
            const onClick = vi.fn();

            mergeEvents(dom, {
                onclick: onClick
            });

            mergeEvents(dom, undefined);

            (dom as HTMLElement).click();

            expect(onClick).not.toHaveBeenCalled();
            expect(dom.__events).toEqual({});
        });

        it('creates a new event controller', () => {
            const dom = createNuvoElement();
            const previousController = dom.__eventController;

            mergeEvents(dom, {});

            expect(dom.__eventController).not.toBe(previousController);
            expect(dom.__eventController?.signal.aborted).toBe(false);
        });

        it('aborts the previous event controller', () => {
            const dom = createNuvoElement();
            const previousController = new AbortController();

            dom.__eventController = previousController;

            mergeEvents(dom, {});

            expect(previousController.signal.aborted).toBe(true);
        });
    });
});
