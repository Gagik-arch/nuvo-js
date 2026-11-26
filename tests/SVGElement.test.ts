import { afterEach, describe, expect, it, vi } from 'vitest';
import SVGElement from '../src/SVGElement';

afterEach(() => document.body.replaceChildren());

describe('SVGElement', () => {
    it('creates an element in the SVG namespace', () => {
        const svg = new SVGElement<SVGSVGElement>('svg', {
            viewBox: '0 0 24 24',
            width: 24
        });

        expect(svg.dom).toBeInstanceOf(SVGSVGElement);
        expect(svg.dom.namespaceURI).toBe('http://www.w3.org/2000/svg');
        expect(svg.dom.getAttribute('viewBox')).toBe('0 0 24 24');
        expect(svg.dom.getAttribute('width')).toBe('24');
    });

    it('supports className, styles, children and attributes', () => {
        const path = new SVGElement<SVGPathElement>('path', {
            className: 'icon-path',
            style: { strokeWidth: '2px' },
            d: 'M0 0L10 10',
            stroke: 'currentColor',
        });

        expect(path.dom.classList.contains('icon-path')).toBe(true);
        expect(path.dom.style.getPropertyValue('stroke-width')).toBe('2px');
        expect(path.dom.getAttribute('d')).toBe('M0 0L10 10');
        expect(path.dom.getAttribute('stroke')).toBe('currentColor');
    });

    it('appends to rootElement and supports Remove', () => {
        const root = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const circle = new SVGElement<SVGCircleElement>('circle', {
            cx: 5, cy: 5, r: 4,
        }, root as unknown as HTMLElement);

        expect(root.firstElementChild).toBe(circle.dom);
        circle.Remove();
        expect(root.childElementCount).toBe(0);
    });

    it('calls OnMount when connected', async () => {
        const circle = new SVGElement<SVGCircleElement>('circle', {
            r: 4
        });
        const callback = vi.fn();

        circle.OnMount(callback);
        document.body.append(circle.dom);

        await vi.waitFor(() => expect(callback).toHaveBeenCalledWith(circle));
    });

    it('calls OnUnMount when removed', async () => {
        const circle = new SVGElement<SVGCircleElement>('circle', {
            r: 4
        });
        const callback = vi.fn();
        document.body.append(circle.dom);

        circle.OnUnMount(callback);
        circle.Remove();

        await vi.waitFor(() => expect(callback).toHaveBeenCalledWith(circle));
    });
});
