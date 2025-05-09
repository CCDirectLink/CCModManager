import { ModEntryLocal } from '../types';
export declare function prepareModName(name: string): string;
export declare class ModInstallDialogs {
    static showModInstallDialog(): void;
    static showAutoUpdateDialog(): void;
    static showModUninstallDialog(localMod: ModEntryLocal): boolean;
    static checkCanDisableMod(mod: ModEntryLocal): boolean;
    static checkCanEnableMod(mod: ModEntryLocal, callback: (deps: ModEntryLocal[] | undefined) => void): void;
}
