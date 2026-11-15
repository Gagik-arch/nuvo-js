import type { DOMElement } from './Element/types';

function Fragment(children: (DOMElement | string | DocumentFragment)[]) {
    const fragment = document.createDocumentFragment();

    fragment.append(...children);
    
    return fragment;
}

export default Fragment;
