import type { InputProps } from './types';
import styles from './input.module.css';
import { Element } from '../../../../dist';

class Input<T extends string | number = string> extends Element<HTMLLabelElement> {
    public readonly input: Element<HTMLInputElement>;

    public constructor({
        type = 'text',
        autocomplete = 'off',
        containerClassName = '',
        className = '',
        startContent,
        endContent,
        variant = 'default',
        name = '',
        events,
        onChange,
        onInput,
        min,
        max,
        value,
        step,
        valueType = 'string',
        ...props
    }: InputProps<T>) {
        super('label', {
            className: [
                styles.root,
                containerClassName,
                styles[`container_${variant}`],
                'squircle-26'
            ].join(' '),
        });

        this.input = new Element<HTMLInputElement>('input', {
            className: [styles.input, className].join(' '),
            type,
            autocomplete,
            name,
            value: value?.toString() ?? '',
            min: typeof min === 'number' ? String(min) : min,
            max: typeof max === 'number' ? String(max) : max,
            step: typeof step === 'number' ? String(step) : step,
            events: {
                onchange: (e: Event) => {
                    const target = e.currentTarget as HTMLInputElement;

                    const v = (
                        valueType === 'number'
                            ? +target.value
                            : target.value
                    ) as T;

                    onChange?.(e, v);
                },

                oninput: (e: Event) => {
                    const target = e.currentTarget as HTMLInputElement;

                    const v = (
                        valueType === 'number'
                            ? +target.value
                            : target.value
                    ) as T;

                    onInput?.(e, v);
                },

                ...events,
            },
            ...props,
        });

        this.SetProps({
            children: [
                startContent,
                this.input.dom,
                endContent
            ],
        });
    }
}

export default Input;
