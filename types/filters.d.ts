import { ModEntry } from './types';
export interface Fliters {
    name?: string;
    hasIcon?: boolean;
    includeLocal?: boolean;
    hideLibraryMods?: boolean;
    tags?: string[];
    hasOptions?: boolean;
}
export declare function createFuzzyFilteredModList<T extends ModEntry>(filters: Fliters, mods: T[]): T[];
