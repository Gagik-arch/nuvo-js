import type nuvojs from './index';

declare global {
    interface Window {
        nuvojs: typeof nuvojs;
    }
}
 
export { }