import { ModEntry, ModEntryLocal } from '../types';
export declare function prepareModName(mod: {
    name: string;
}): string;
export declare class ModInstallDialogs {
    static showModInstallDialog(autoupdate?: boolean): void;
    static showAutoUpdateDialog(): void;
    static showModUninstallDialog(localMod: ModEntryLocal): boolean;
    static checkCanDisableMod(mod: ModEntryLocal): boolean;
    static showEnableModDialog(mod: ModEntryLocal): Promise<void>;
    static checkCanEnableMod(mod: ModEntry): Promise<Set<ModEntryLocal> | undefined>;
    static showYesNoDialog(text: sc.TextLike, icon?: Nullable<sc.DIALOG_INFO_ICON>): Promise<number>;
}
