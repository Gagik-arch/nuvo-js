import type { ElementPropsType } from '@nuvo-js/core/types';

export type InputProps<T> = Omit<ElementPropsType<HTMLInputElement>, 'min' | 'max' | 'step' | 'value'> & {
    containerClassName?: string;
    startContent?: HTMLElement | string | DocumentFragment;
    endContent?: HTMLElement | string;
    variant?: 'default' | 'editor';
    onChange?: (e:Event, value: T) => void;
    onInput?: (e: Event, value: T) => void;
    value?: T;
    step?: T;
    min?: T;
    max?: T;
    valueType?: 'string' | 'number';
};
