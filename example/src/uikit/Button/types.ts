import type { ElementPropsType } from '../../../../dist/types';

export type ButtonProps = ElementPropsType<HTMLButtonElement> & {
    variant?: 'default' | 'error' | 'primary';
    onPress?: (e:MouseEvent) => void;
};
