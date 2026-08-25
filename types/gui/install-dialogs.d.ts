import type { ModEntry, ModEntryLocal } from '../types';
declare global {
    namespace modmanager.gui {
        var ModInstallDialogs: ModInstallDialogs;
    }
}
declare class ModInstallDialogs {
    installModsFunc(dialog: modmanager.gui.MultiPageButtonBoxGui, modCount: number, autoupdate?: boolean): Promise<void>;
    showModInstallDialog(autoupdate?: boolean): void;
    showAutoUpdateDialog(): void;
    showModUninstallDialog(localMod: ModEntryLocal): boolean;
    checkCanDisableMod(mod: ModEntryLocal): boolean;
    showEnableModDialog(mod: ModEntryLocal): Promise<void>;
    checkCanEnableMod(mod: ModEntry): Promise<Set<ModEntryLocal> | undefined>;
    showYesNoDialog(text: sc.TextLike, icon?: Nullable<sc.DIALOG_INFO_ICON>): Promise<number>;
}
export {};
