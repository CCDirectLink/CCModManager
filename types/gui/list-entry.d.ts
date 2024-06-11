import { ModEntry, ModEntryLocal } from '../types';
import './list-entry-highlight';
declare global {
    namespace modmanager.gui {
        interface ModListEntry extends ig.FocusGui, sc.Model.Observer {
            ninepatch: ig.NinePatch;
            mod: ModEntry;
            iconOffset: number;
            nameIconPrefixesText: sc.TextGui;
            nameText: sc.TextGui;
            textColor: COLOR;
            description: sc.TextGui;
            versionText: sc.TextGui;
            starCount?: sc.TextGui;
            lastUpdated?: sc.TextGui;
            authors?: sc.TextGui;
            tags?: sc.TextGui;
            modList: modmanager.gui.ModMenuList;
            highlight: ModListEntryHighlight;
            modEntryActionButtonStart: {
                height: number;
                ninepatch: ig.NinePatch;
                highlight: sc.ButtonGui.Highlight;
            };
            modEntryActionButtons: sc.ButtonGui.Type & {
                ninepatch: ig.NinePatch;
            };
            iconGui: ig.ImageGui;
            tryDisableMod(this: this, mod: ModEntryLocal): string | undefined;
            tryEnableMod(this: this, mod: ModEntryLocal): string | undefined;
            toggleSelection(this: this, force?: boolean): string | undefined;
            getModName(this: this): {
                icon: string;
                text: string;
            };
            onButtonPress(this: this): void;
            setNameText(this: this, color?: COLOR): void;
            updateHighlightWidth(this: this): void;
            onButtonPress(this: this): string | undefined;
        }
        interface ModListEntryConstructor extends ImpactClass<ModListEntry> {
            new (mod: ModEntry, modList: modmanager.gui.ModMenuList): ModListEntry;
        }
        var ModListEntry: ModListEntryConstructor;
    }
}
declare const COLOR: {
    readonly WHITE: 0;
    readonly RED: 1;
    readonly GREEN: 2;
    readonly YELLOW: 3;
};
type COLOR = (typeof COLOR)[keyof typeof COLOR];
export {};
