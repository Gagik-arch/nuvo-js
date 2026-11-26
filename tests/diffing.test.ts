import { describe, expect, it } from 'vitest';
import Element from '../src/Element';

describe('DOM child reconciliation', () => {
    it('updates text children in place by position', () => {
        const list = new Element<HTMLUListElement>('ul',{
                children: [
                    new Element<HTMLLIElement>('li',{ children: ['A'] } ).dom,
                    new Element<HTMLLIElement>('li',{ children: ['B']  }).dom,
                ],
        });

        const oldFirst = list.dom.children[0];
        list.SetProps({
            children: [
                new Element<HTMLLIElement>('li',{  children: ['Updated A'] } ).dom,
                new Element<HTMLLIElement>('li',{  children: ['Updated B']  }).dom,
            ],
        });

        expect(list.dom.textContent).toBe('Updated AUpdated B');
        expect(list.dom.children[0]).not.toBe(oldFirst);
    });

    it('inserts and removes unkeyed children', () => {
        const list = new Element<HTMLUListElement>('ul',{
          children: [document.createElement('li'), document.createElement('li')] ,
        });

        list.SetProps({ children: [document.createElement('li')] });
        expect(list.dom.children).toHaveLength(1);

        list.SetProps({ children: [
            document.createElement('li'),
            document.createElement('li'),
            document.createElement('li'),
        ] });
        expect(list.dom.children).toHaveLength(3);
    });

    it('reorders keyed children while reusing existing nodes', () => {
        const make = (key: string, text: string) =>
            new Element<HTMLLIElement>('li',{
              key, children: [text] ,
            }).dom;

        const a = make('a', 'A');
        const b = make('b', 'B');
        const c = make('c', 'C');
        const list = new Element<HTMLUListElement>('ul',{
           children: [a, b, c] ,
        });

        list.SetProps({ children: [make('c', 'C'), make('a', 'A'), make('b', 'B')] });

        expect(Array.from(list.dom.children)).toEqual([c, a, b]);
        expect(list.dom.textContent).toBe('CAB');
    });

    it('rejects a mixture of keyed and unkeyed siblings', () => {
        const keyed = new Element<HTMLLIElement>('li',{
            key: 'one' ,
        }).dom;

        const list = new Element<HTMLUListElement>('ul',{
            children: [] ,
        });

        expect(() => list.SetProps({
            children: [keyed, document.createElement('li')],
        })).toThrow('Nuvo: All sibling elements must have a key when using keyed diffing.');
    });

    it('rejects duplicate sibling keys', () => {
        const make = () => new Element<HTMLLIElement>('li',{
            key: 'duplicate' ,
        }).dom;

        const list = new Element<HTMLUListElement>('ul',{
           children: [] ,
        });

        expect(() => list.SetProps({ children: [make(), make()] }))
            .toThrow('Nuvo: Duplicate keys detected among sibling elements.');
    });

    it('force-updates children by replacing all existing nodes', () => {
        const original = document.createElement('span');
        const replacement = document.createElement('span');
        const parent = new Element<HTMLDivElement>('div',{
           children: [original] ,
        });

        parent.SetProps({ children: [replacement] }, true);

        expect(parent.dom.firstElementChild).toBe(replacement);
        expect(parent.dom.firstElementChild).not.toBe(original);
    });
});
