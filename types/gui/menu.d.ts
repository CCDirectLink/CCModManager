import { ModEntry } from '../types';
import './list';
import './filters';
import './options/mod-options-menu';
declare global {
    namespace sc {
        enum MOD_MENU_SORT_ORDER {
            NAME,
            STARS,
            LAST_UPDATED
        }
        enum MOD_MENU_MESSAGES {
            SELECTED_ENTRIES_CHANGED,
            TAB_CHANGED,
            UPDATE_ENTRIES,
            ENTRY_FOCUSED,
            ENTRY_UNFOCUSED,
            ENTRY_UPDATE_COLOR
        }
        interface ModMenu extends sc.ListInfoMenu, sc.Model {
            list: ModMenuList;
            inputField: nax.ccuilib.InputField;
            installButton: sc.ButtonGui;
            uninstallButton: sc.ButtonGui;
            testingToggleButton: sc.ButtonGui;
            openRepositoryUrlButton: sc.ButtonGui;
            modOptionsButton: sc.ButtonGui;
            checkUpdatesButton: sc.ButtonGui;
            filtersButton: sc.ButtonGui;
            filtersPopup: sc.FiltersPopup;
            reposPopup: sc.ModMenuRepoAddPopup;
            initInputField(this: this): void;
            initSortMenu(this: this): void;
            initInstallButton(this: this, bottomY: number): void;
            initUninstallButton(this: this, bottomY: number): void;
            initCheckUpdatesButton(this: this, bottomY: number): void;
            initFiltersButton(this: this, bottomY: number): void;
            initTestingToggleButton(this: this): void;
            initOpenRepositoryUrlButton(this: this): void;
            initModOptionsButton(this: this, bottomY: number): void;
            setBlackBarVisibility(this: this, visible: boolean): void;
            setAllVisibility(this: this, visible: boolean): void;
            updateInstallButtonText(this: this): void;
            onBackButtonPress(this: this): void;
            setTabEvent(this: this): void;
            showModInstallDialog(this: this): void;
            getCurrentlyFocusedModEntry(this: this): sc.ModListEntry | undefined;
            openModSettings(this: this, mod: ModEntry): void;
            openRepositoriesPopup(this: this): void;
        }
        interface ModMenuConstructor extends ImpactClass<ModMenu> {
            new (): ModMenu;
        }
        var ModMenu: ModMenuConstructor;
        var modMenuGui: ModMenu;
    }
}
