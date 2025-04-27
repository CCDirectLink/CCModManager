import { ModEntry, ModEntryLocal, ModImageConfig } from '../types';
import './list-entry-highlight';
declare global {
    namespace modmanager.gui {
        interface ListEntry extends ig.FocusGui, sc.Model.Observer {
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
            modList: modmanager.gui.MenuList;
            highlight: ListEntryHighlight;
            modEntryActionButtonStart: {
                height: number;
                ninepatch: ig.NinePatch;
                highlight: sc.ButtonGui.Highlight;
            };
            modEntryActionButtons: sc.ButtonGui.Type & {
                ninepatch: ig.NinePatch;
            };
            iconGui: ig.ImageGui;
            addObservers(this: this): void;
            removeObservers(this: this): void;
            updateIcon(this: this, config: ModImageConfig): void;
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
        interface ListEntryConstructor extends ImpactClass<ListEntry> {
            new (mod: ModEntry, modList: modmanager.gui.MenuList): ListEntry;
        }
        var ListEntry: ListEntryConstructor;
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
