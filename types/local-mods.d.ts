import { ModEntry, ModEntryLocal } from './types';
import type { ValidTags } from 'ccmoddb/build/src/types';
interface CCL2Mod {
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
    repository?: string;
    homepage?: string;
    tags?: ValidTags[];
    authors?: string[] | string;
    assets?: string[];
    active?: boolean;
}
declare global {
    var activeMods: CCL2Mod[];
    var inactiveMods: CCL2Mod[];
    var versions: {
        ccloader: string;
        crosscode: string;
    };
    namespace modloader {
        const _runtimeMod: Mod;
    }
}
export declare class LocalMods {
    private static cache;
    private static cacheRecord;
    private static cacheRecordByName;
    static localModFlags: Record<string, {
        disableUninstall?: boolean;
        disableDisabling?: boolean;
        disableUpdate?: boolean;
    }>;
    static initAll(): Promise<void>;
    static checkForUpdates(): void;
    static refreshOrigin(): Promise<void>;
    static getAll(): ModEntryLocal[];
    private static createVirtualLocalMods;
    private static convertServerToLocal;
    static getAllRecord(): Record<string, ModEntryLocal>;
    static getActive(): ModEntryLocal[];
    static getInactive(): ModEntryLocal[];
    static setModActive(mod: ModEntryLocal, value: boolean): void;
    private static convertCCL2Mod;
    private static convertCCL3Mod;
    static getCCVersion(): string;
    static getCCLoaderVersion(): string;
    static findDeps(mod: ModEntry, deps?: Set<ModEntryLocal>, missing?: Set<string>): {
        deps: Set<ModEntryLocal>;
        missing: Set<string>;
    };
}
export {};
