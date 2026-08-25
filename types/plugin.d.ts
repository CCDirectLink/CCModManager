import type { Mod1 } from './types';
import './mod-options';
export declare function loadEverything(force?: boolean): Promise<string[] | undefined>;
export default class ModManager {
    private lang;
    constructor(mod: Mod1);
    prestart(): Promise<void>;
    poststart(): Promise<void>;
}
