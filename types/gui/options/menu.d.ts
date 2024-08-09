import { ModEntry } from '../../types';
declare global {
    namespace sc {
        interface ModSettingsMenu extends sc.BaseMenu {
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
            updateEntries(this: this, mod: ModEntry): void;
            resetOptionsToDefault(this: this): void;
        }
        interface ModSettingsMenuConstructor extends ImpactClass<ModSettingsMenu> {
            new (): ModSettingsMenu;
        }
        var ModSettingsMenu: ModSettingsMenuConstructor;
        var modSettingsMenu: ModSettingsMenu;
        enum MENU_SUBMENU {
            MOD_SETTINGS = 375943
        }
    }
}
import './tabbox';
import './option-row';
import './tabbutton';
import './option-elements-inject';
