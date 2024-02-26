import { ModEntryLocal } from '../types';
export declare function prepareModName(name: string): string;
export declare class ModInstallDialogs {
    static showModInstallDialog(): void;
    static showAutoUpdateDialog(): void;
    static showModUninstallDialog(localMod: ModEntryLocal): void;
    static checkCanDisableMod(mod: ModEntryLocal): boolean;
    static checkCanEnableMod(mod: ModEntryLocal): Promise<ModEntryLocal[] | undefined>;
}
