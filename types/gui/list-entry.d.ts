import type { ModImageConfig } from '../types';
import { COLOR } from './colors';
import './list-entry-highlight';
export interface ListEntryConfig {
    description?: string;
    version?: string;
    authors?: string[];
    tags?: string[];
    lastUpdateTimestamp?: number;
    stars?: number;
}
declare global {
    namespace modmanager.gui {
        interface ListEntry extends ig.FocusGui, sc.Model.Observer {
            ninepatch: ig.NinePatch;
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
            setNameText(this: this, color?: COLOR): void;
            updateHighlightWidth(this: this): void;
            getName(this: this): {
                icon: string;
                text: string;
            };
            getIcon(this: this): Promise<ModImageConfig>;
            onButtonPress(this: this): void;
        }
        interface ListEntryConstructor extends ImpactClass<ListEntry> {
            new (config: ListEntryConfig, modList: modmanager.gui.MenuList): ListEntry;
        }
        var ListEntry: ListEntryConstructor;
    }
}
