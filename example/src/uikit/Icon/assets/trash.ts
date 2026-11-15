import { SVGElement } from '../../../../../dist';
import type { SVGElementPropsType } from '../../../../../dist/types';

function Trash(props: SVGElementPropsType) {
    return (
        new SVGElement('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            width: 24,
            height: 24,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 4,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            ...props,
            children: [
                new SVGElement<SVGPolylineElement>('polyline',
                    {
                        points: '3 6 5 6 21 6' as SVGPointList & string,
                        strokeWidth: 4,
                    }).dom,

                new SVGElement<SVGPathElement>('path',
                    {
                        strokeWidth: 4,
                        d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
                    }).dom
            ],
        }).dom
    );
}

export default Trash;
