import { ModEntry } from '../../types';
import { ModOptionsSettings } from '../../mod-options';
declare global {
    namespace modmanager {
        function openModOptionsMenu(modId: string, tab?: number): void;
    }
    namespace modmanager.gui {
        interface OptionsMenu extends sc.BaseMenu, sc.Model.Observer {
            mod: ModEntry;
            helpGui: sc.HelpScreen;
            hotkeyHelp: sc.ButtonGui;
            hotkeyDefault: sc.ButtonGui;
            listBox: modmanager.gui.OptionsTabBox;
            initHotkeyHelp(this: this): void;
            initHotkeyDefault(this: this): void;
            initListBox(this: this): void;
            createHelpGui(this: this): void;
            commitHotKeysToTopBar(this: this, longTransition?: boolean): void;
            getHelpMenuLangData(this: this): ModOptionsSettings['helpMenu'];
            updateHelpButtonVisibility(this: this): void;
            updateEntries(this: this, mod: ModEntry): void;
            resetOptionsToDefault(this: this): void;
            reopenMenu(this: this): void;
        }
        interface OptionsMenuConstructor extends ImpactClass<OptionsMenu> {
            new (): OptionsMenu;
        }
        var OptionsMenu: OptionsMenuConstructor;
        var optionsMenu: OptionsMenu;
    }
    namespace sc {
        enum MENU_SUBMENU {
            MOD_OPTIONS = 375943
        }
    }
}
import './tabbox';
import './option-row';
import './tabbutton';
