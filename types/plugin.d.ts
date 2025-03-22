import { Mod1 } from './types';
import './mod-options';
export declare function isFullMode(): boolean;
export declare function openLink(url: string): void;
export default class ModManager {
    static dir: string;
    static mod: Mod1;
    private lang;
    constructor(mod: Mod1);
    prestart(): Promise<void>;
    poststart(): Promise<void>;
}
