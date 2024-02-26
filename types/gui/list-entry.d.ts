import { ModEntry, ModEntryLocal } from '../types';
import './list-entry-highlight';
declare global {
    namespace sc {
        interface ModListEntry extends ig.FocusGui, sc.Model.Observer {
            ninepatch: ig.NinePatch;
            mod: ModEntry;
            iconOffset: number;
            nameIconPrefixesText: sc.TextGui;
            nameText: sc.TextGui;
            description: sc.TextGui;
            versionText: sc.TextGui;
            starCount?: sc.TextGui;
            lastUpdated?: sc.TextGui;
            authors?: sc.TextGui;
            tags?: sc.TextGui;
            modList: sc.ModMenuList;
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
            getModName(this: this): {
                icon: string;
                text: string;
            };
            onButtonPress(this: this): void;
            setNameText(this: this, color: COLORS): void;
            updateHighlightWidth(this: this): void;
            onButtonPress(this: this): string | undefined;
        }
        interface ModListEntryConstructor extends ImpactClass<ModListEntry> {
            new (mod: ModEntry, modList: sc.ModMenuList): ModListEntry;
        }
        var ModListEntry: ModListEntryConstructor;
    }
}
declare enum COLORS {
    WHITE = 0,
    RED = 1,
    GREEN = 2,
    YELLOW = 3
}
export {};
