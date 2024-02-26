import { ModEntry } from '../types';
import { Fliters } from '../filters';
import './list-entry';
import './repo-add';
declare global {
    namespace sc {
        interface ModMenuList extends sc.ListTabbedPane, sc.Model.Observer {
            filters: Fliters;
            tabz: {
                name: string;
                icon: string;
                populateFunc: (list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER) => void;
            }[];
            currentSort: sc.MOD_MENU_SORT_ORDER;
            reposPopup: sc.ModMenuRepoAddPopup;
            gridColumns: number;
            isGrid: boolean;
            updateColumnCount(this: this): void;
            reloadFilters(this: this): void;
            reloadEntries(this: this): void;
            sortModEntries(this: this, mods: ModEntry[], sort: sc.MOD_MENU_SORT_ORDER): void;
            populateOnline(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void;
            populateSelected(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void;
            populateEnabled(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void;
            populateDisabled(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void;
            populateSettings(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup): void;
            populateListFromMods(this: this, mods: ModEntry[], list: sc.ButtonListBox): void;
        }
        interface ModMenuListConstructor extends ImpactClass<ModMenuList> {
            new (): ModMenuList;
        }
        var ModMenuList: ModMenuListConstructor;
    }
}
export declare const modMenuListWidth = 552;
export declare enum MOD_MENU_TAB_INDEXES {
    ONLINE = 0,
    SELECTED = 1,
    ENABLED = 2,
    DISABLED = 3,
    SETTINGS = 4
}
