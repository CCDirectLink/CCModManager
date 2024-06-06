import { ModEntry } from '../../types';
import { ModOptionsSettings } from '../../mod-options';
declare global {
    namespace sc {
        interface ModSettingsMenu extends sc.BaseMenu, sc.Model.Observer {
            mod: ModEntry;
            helpGui: sc.HelpScreen;
            hotkeyHelp: sc.ButtonGui;
            hotkeyDefault: sc.ButtonGui;
            listBox: sc.ModSettingsTabBox;
            initHotkeyHelp(this: this): void;
            initHotkeyDefault(this: this): void;
            initListBox(this: this): void;
            createHelpGui(this: this): void;
            commitHotKeysToTopBar(this: this, longTransition?: boolean): void;
            getHelpMenuLangData(this: this): ModOptionsSettings['helpMenu'];
            updateHelpButtonVisibility(this: this): void;
            updateEntries(this: this, mod: ModEntry): void;
            resetOptionsToDefault(this: this): void;
        }
        interface ModSettingsMenuConstructor extends ImpactClass<ModSettingsMenu> {
            new (): ModSettingsMenu;
        }
        var ModOptionsMenu: ModSettingsMenuConstructor;
        var modSettingsMenu: ModSettingsMenu;
        enum MENU_SUBMENU {
            MOD_OPTIONS = 375943
        }
    }
}
import './tabbox';
import './option-row';
import './tabbutton';
import './option-elements-inject';
