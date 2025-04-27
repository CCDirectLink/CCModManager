import { ModEntry, ModEntryServer } from '../types';
import './list';
import './filters';
import './multipage-button-box';
import './changelog';
import './options/mod-options-menu';
import './manual-enforcer';
declare global {
    namespace modmanager.gui {
        enum MENU_SORT_ORDER {
            NAME,
            STARS,
            LAST_UPDATED
        }
        enum MENU_MESSAGES {
            SELECTED_ENTRIES_CHANGED,
            TAB_CHANGED,
            UPDATE_ENTRIES,
            ENTRY_FOCUSED,
            ENTRY_UNFOCUSED,
            ENTRY_UPDATE_COLOR
        }
        interface Menu extends sc.ListInfoMenu, sc.Model {
            list: MenuList;
            inputField: nax.ccuilib.InputField;
            installButton: sc.ButtonGui;
            uninstallButton: sc.ButtonGui;
            testingToggleButton: sc.ButtonGui;
            openRepositoryUrlButton: sc.ButtonGui;
            modOptionsButton: sc.ButtonGui;
            checkUpdatesButton: sc.ButtonGui;
            filtersButton: sc.ButtonGui;
            filtersPopup: modmanager.gui.FiltersPopup;
            reposPopup: modmanager.gui.RepoAddPopup;
            changelogButton: sc.ButtonGui;
            changelogPopup?: modmanager.gui.Changelog;
            initInputField(this: this): void;
            initSortMenu(this: this): void;
            initInstallButton(this: this, bottomY: number): void;
            initUninstallButton(this: this, bottomY: number): void;
            initCheckUpdatesButton(this: this, bottomY: number): void;
            initFiltersButton(this: this, bottomY: number): void;
            initTestingToggleButton(this: this): void;
            initOpenRepositoryUrlButton(this: this): void;
            initModOptionsButton(this: this, bottomY: number): void;
            initChangelogButton(this: this): void;
            isInMenuStack(this: this): boolean;
            setBlackBarVisibility(this: this, visible: boolean): void;
            setAllVisibility(this: this, visible: boolean): void;
            updateInstallButtonText(this: this): void;
            setTabEvent(this: this): void;
            showModInstallDialog(this: this): void;
            getCurrentlyFocusedModEntry(this: this): modmanager.gui.ListEntry | undefined;
            openModSettings(this: this, mod: ModEntry): void;
            openRepositoriesPopup(this: this): void;
            openChangelogPopup(this: this, mod: ModEntryServer): void;
        }
        interface MenuConstructor extends ImpactClass<Menu> {
            new (): Menu;
        }
        var Menu: MenuConstructor;
        var menu: Menu;
    }
    namespace sc {
        enum MENU_SUBMENU {
            MODS
        }
    }
}
