import { ModEntryLocal } from './types';
type CCL2Mod = {
    baseDirectory: string;
    dependencies?: Record<string, string>;
    disabled: boolean;
    name: string;
    displayName?: string;
    description?: string;
    version: string;
    icons?: {
        '24'?: string;
    };
    active?: boolean;
};
declare global {
    var activeMods: CCL2Mod[];
    var inactiveMods: CCL2Mod[];
    var versions: {
        ccloader: string;
        crosscode: string;
    };
}
export declare class LocalMods {
    private static cache;
    private static cacheRecord;
    static getAll(force?: boolean): ModEntryLocal[];
    static getAllRecord(): Record<string, ModEntryLocal>;
    static getActive(): ModEntryLocal[];
    static getInactive(): ModEntryLocal[];
    static setModActive(mod: ModEntryLocal, value: boolean): void;
    private static convertCCL2Mod;
    private static convertCCL3Mod;
    static getCCVersion(): string;
    static getCCLoaderVersion(): string;
    static findDeps(mod: ModEntryLocal): ModEntryLocal[];
}
export {};
