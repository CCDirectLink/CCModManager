import { Mod1 } from './types';
export default class ModManager {
    static dir: string;
    static mod: Mod1;
    constructor(mod: Mod1);
    prestart(): Promise<void>;
    poststart(): Promise<void>;
}
