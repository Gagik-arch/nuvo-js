import { afterEach, describe, expect, it, vi } from 'vitest';
import Element from '../src/Element';

afterEach(() => {
    document.body.replaceChildren();
});

describe('Element', () => {
    it('creates the requested native HTML element', () => {
        const element = new Element<HTMLButtonElement>('button',{
           children: ['Save'] ,
        });

        expect(element.dom).toBeInstanceOf(HTMLButtonElement);
        expect(element.dom.tagName).toBe('BUTTON');
        expect(element.dom.textContent).toBe('Save');
    });

    it('appends itself to rootElement when provided', () => {
        const root = document.createElement('main');
        const element = new Element<HTMLDivElement>('div',{},root);

        expect(root.firstElementChild).toBe(element.dom);
    });

    it('sets className, style, standard properties and data attributes', () => {
        const element = new Element<HTMLDivElement>('div',{
                className: 'card active',
                style: { backgroundColor: 'red', marginTop: '4px' },
                id: 'profile',
                title: 'Profile card',
                'data-testid': 'profile-card',
        });

        expect(element.dom.className).toBe('card active');
        expect(element.dom.style.backgroundColor).toBe('red');
        expect(element.dom.style.marginTop).toBe('4px');
        expect(element.dom.id).toBe('profile');
        expect(element.dom.title).toBe('Profile card');
        expect(element.dom.getAttribute('data-testid')).toBe('profile-card');
    });

    it('supports className callback for conditional classes', () => {
        const element = new Element<HTMLDivElement>('div',{
                className: classes => {
                    classes.add('active');
                    classes.add('selected');
                },
        });

        expect(element.dom.classList.contains('active')).toBe(true);
        expect(element.dom.classList.contains('selected')).toBe(true);
    });

    it('updates properties and removes nullable attributes', () => {
        const element = new Element<HTMLDivElement>('div',{
            id: 'before', title: 'old' ,
        });

        expect(element.SetProps({ id: 'after', title: null })).toBe(element);
        expect(element.dom.id).toBe('after');
        expect(element.dom.hasAttribute('title')).toBe(false);
    });

    it('handles input value as a DOM value and attribute', () => {
        const input = new Element<HTMLInputElement>('input',{
            value: 'first' ,
        });

        input.SetProps({ value: 'second' });
        expect(input.dom.value).toBe('second');
        expect(input.dom.getAttribute('value')).toBe('second');

        input.SetProps({ value: null });
        expect(input.dom.value).toBe('');
    });

    it('updates children and rejects non-array children at runtime', () => {
        const element = new Element<HTMLDivElement>('div',{
          children: ['first'] ,
        });

        element.SetProps({ children: ['second', 'third'] });
        expect(element.dom.textContent).toBe('secondthird');

        expect(() => element.SetProps({
            children: 'not-an-array' as unknown as string[],
        })).toThrow('Nuvo: Children must be an array.');
    });

    it('registers event handlers and removes them on Destroy', () => {
        const onClick = vi.fn();
        const element = new Element<HTMLButtonElement>('button',{
            events: { onclick: onClick } ,
        });

        element.dom.click();
        expect(onClick).toHaveBeenCalledTimes(1);

        element.Destroy();
        element.dom.click();
        expect(onClick).toHaveBeenCalledTimes(1);
        expect(element.dom.isConnected).toBe(false);
    });

    it('Remove detaches the node without destroying its event controller', () => {
        const onClick = vi.fn();
        const element = new Element<HTMLButtonElement>('button',{
             events: { onclick: onClick } ,
        });
        document.body.append(element.dom);

        element.Remove();
        element.dom.click();

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('calls OnMount immediately when already connected', () => {
        const element = new Element<HTMLDivElement>('div');

        document.body.append(element.dom);
        const callback = vi.fn();

        expect(element.OnMount(callback)).toBe(element);
        expect(callback).toHaveBeenCalledWith(element);
    });

    it('calls OnMount after the node is connected', async () => {
        const element = new Element<HTMLDivElement>('div');
        const callback = vi.fn();

        element.OnMount(callback);
        document.body.append(element.dom);

        await vi.waitFor(() => expect(callback).toHaveBeenCalledWith(element));
    });

    it('calls OnUnMount after the connected node is removed', async () => {
        const element = new Element<HTMLDivElement>('div');
        const callback = vi.fn();
        document.body.append(element.dom);

        element.OnUnMount(callback);
        element.Remove();

        await vi.waitFor(() => expect(callback).toHaveBeenCalledWith(element));
    });
});
