import { ModEntry } from '../types';
import { Fliters } from '../filters';
import './list-entry';
import './repo-add';
declare global {
    namespace modmanager.gui {
        interface MenuList extends sc.ListTabbedPane, sc.Model.Observer {
            filters: Fliters;
            tabz: {
                name: string;
                icon: string;
                populateFunc: (list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: modmanager.gui.MENU_SORT_ORDER) => void;
            }[];
            currentSort: modmanager.gui.MENU_SORT_ORDER;
            gridColumns: number;
            restoreLastPosition?: {
                tab: number;
                element: Vec2;
            };
            updateColumnCount(this: this): void;
            reloadFilters(this: this): void;
            reloadEntries(this: this): void;
            sortModEntries(this: this, mods: ModEntry[], sort: modmanager.gui.MENU_SORT_ORDER): void;
            populateOnline(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: modmanager.gui.MENU_SORT_ORDER): void;
            populateSelected(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: modmanager.gui.MENU_SORT_ORDER): void;
            populateEnabled(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: modmanager.gui.MENU_SORT_ORDER): void;
            populateDisabled(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: modmanager.gui.MENU_SORT_ORDER): void;
            populateListFromMods(this: this, mods: ModEntry[], list: sc.ButtonListBox): void;
        }
        interface MenuListConstructor extends ImpactClass<MenuList> {
            new (): MenuList;
        }
        var MenuList: MenuListConstructor;
        var MOD_MENU_TAB_INDEXES: {
            ONLINE: number;
            SELECTED: number;
            ENABLED: number;
            DISABLED: number;
        };
    }
}
export declare const modMenuListWidth = 552;
