import 'nax-ccuilib/src/headers/nax/input-field.d.ts';
import 'nax-ccuilib/src/headers/nax/input-field-cursor.d.ts';
import 'nax-ccuilib/src/headers/nax/input-field-type.d.ts';
import './list';
import './filters';
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
            REPOSITORY_CHANGED,
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
            checkUpdatesButton: sc.ButtonGui;
            filtersButton: sc.ButtonGui;
            filtersPopup: sc.FiltersPopup;
            setBlackBarVisibility(this: this, visible: boolean): void;
            setAllVisibility(this: this, visible: boolean): void;
            updateInstallButtonText(this: this): void;
            onBackButtonPress(this: this): void;
            setTabEvent(this: this): void;
            showModInstallDialog(this: this): void;
        }
        interface ModMenuConstructor extends ImpactClass<ModMenu> {
            new (): ModMenu;
        }
        var ModMenu: ModMenuConstructor;
        var modMenu: ModMenu;
    }
}
