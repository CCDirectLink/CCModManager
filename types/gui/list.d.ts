import type { ModEntry } from '../types';
import { type Filters } from '../filters';
import './mod-list-entry';
type ListPopulateFunc<T> = (this: T, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: modmanager.gui.MENU_SORT_ORDER) => void;
declare global {
    namespace modmanager.gui {
        interface MenuList extends sc.ListTabbedPane, sc.Model.Observer {
            filters: Filters;
            tabz: {
                name: string;
                icon: string;
                populateFunc: ListPopulateFunc<any>;
            }[];
            currentSort: modmanager.gui.MENU_SORT_ORDER;
            gridColumns: number;
            restoreLastPosition?: {
                tab: number;
                element: Vec2;
                scrollY: number;
            };
            updateColumnCount(this: this): void;
            reloadFilters(this: this): void;
            reloadEntries(this: this): void;
            sortModEntries(this: this, mods: ModEntry[], sort: modmanager.gui.MENU_SORT_ORDER): void;
            populateOnline: ListPopulateFunc<this>;
            populateSelected: ListPopulateFunc<this>;
            populateEnabled: ListPopulateFunc<this>;
            populateDisabled: ListPopulateFunc<this>;
            populateSettings: ListPopulateFunc<this>;
            populateListFromMods(this: this, mods: ModEntry[], list: sc.ButtonListBox): void;
            savePosition(this: this): void;
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
            SETTINGS: number;
        };
    }
}
export {};
