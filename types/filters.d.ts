import type { ModEntry } from './types';
export interface Filters {
    name?: string;
    hasIcon?: boolean;
    includeLocal?: boolean;
    hideLibraryMods?: boolean;
    tags?: string[];
    hasOptions?: boolean;
}
export declare function createFuzzyFilteredModList<T extends ModEntry>(filters: Filters, mods: T[]): T[];
