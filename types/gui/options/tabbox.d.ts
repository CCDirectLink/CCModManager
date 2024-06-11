import type { ModSettingsGui } from '../../mod-options';
import { ModEntry } from '../../types';
export {};
declare global {
    namespace modmanager.gui {
        namespace ModSettingsTabBox {
            type GuiOption = sc.OptionInfoBox | modmanager.gui.ModOptionsOptionRow | modmanager.gui.ModOptionsOptionButton;
        }
        interface ModSettingsTabBox extends ig.GuiElementBase, sc.Model.Observer {
            gfx: ig.Image;
            mod: ModEntry;
            conf: ModSettingsGui;
            opts: Record<string, any>;
            currentTab: number;
            lastButtonData: modmanager.gui.ModSettingsTabBox.TabButton['data'];
            prevIndex: number;
            tabs: Record<string, modmanager.gui.ModSettingsTabBox.TabButton>;
            tabArray: modmanager.gui.ModSettingsTabBox.TabButton[];
            tabGroup: sc.ButtonGroup;
            rows: modmanager.gui.ModSettingsTabBox.GuiOption[];
            rowButtonGroup: sc.RowButtonGroup;
            tabContent: {
                buttonGroup: Nullable<modmanager.gui.ModSettingsTabBox['rowButtonGroup']>;
                list: Nullable<modmanager.gui.ModSettingsTabBox['list']>;
                rows: Nullable<modmanager.gui.ModSettingsTabBox['rows']>;
            }[];
            list: sc.ButtonListBox;
            prevPressed: modmanager.gui.ModSettingsTabBox.TabButton;
            menuScanLines: sc.MenuScanLines;
            keyBinder: sc.KeyBinderGui;
            initTabGroup(this: this): void;
            initMenuPanel(this: this): void;
            initMenuScanLines(this: this): void;
            initBackgroundTexture(this: this): void;
            initBackgroundColor(this: this): void;
            updateEntries(this: this, mod: ModEntry): void;
            createTabs(this: this): void;
            showMenu(this: this): void;
            hideMenu(this: this): void;
            _createOptionList(this: this, category: string): void;
            _rearrangeTabs(this: this): void;
            _createCacheList(this: this, category: string, bool1?: boolean, bool2?: boolean): void;
            _createTabButton(this: this, title: string, x: number, categoryId: string, icon?: string): modmanager.gui.ModSettingsTabBox.TabButton;
            onButtonTraversal(this: this): void;
            _resetButtons(this: this, tabButton?: modmanager.gui.ModSettingsTabBox.TabButton, unfocus?: boolean): void;
            setCurrentTab(this: this, tabIndex: number): void;
            addObservers(this: this): void;
            removeObservers(this: this): void;
        }
        interface ModSettingsTabBoxConstructor extends ImpactClass<ModSettingsTabBox> {
            TabButton: modmanager.gui.ModSettingsTabBox.TabButtonConstructor;
            new (): ModSettingsTabBox;
        }
        var ModSettingsTabBox: ModSettingsTabBoxConstructor;
    }
}
