import type { ModSettingsGui } from '../../mod-options';
import { ModEntry } from '../../types';
export {};
declare global {
    namespace sc {
        namespace ModSettingsTabBox {
            type GuiOption = sc.OptionInfoBox | sc.ModOptionsOptionRow | sc.ModOptionsOptionButton;
        }
        interface ModSettingsTabBox extends ig.GuiElementBase, sc.Model.Observer {
            gfx: ig.Image;
            mod: ModEntry;
            conf: ModSettingsGui;
            opts: Record<string, any>;
            currentTab: number;
            lastButtonData: sc.ModSettingsTabBox.TabButton['data'];
            prevIndex: number;
            tabs: Record<string, sc.ModSettingsTabBox.TabButton>;
            tabArray: sc.ModSettingsTabBox.TabButton[];
            tabGroup: sc.ButtonGroup;
            rows: sc.ModSettingsTabBox.GuiOption[];
            rowButtonGroup: sc.RowButtonGroup;
            tabContent: {
                buttonGroup: Nullable<sc.ModSettingsTabBox['rowButtonGroup']>;
                list: Nullable<sc.ModSettingsTabBox['list']>;
                rows: Nullable<sc.ModSettingsTabBox['rows']>;
            }[];
            list: sc.ButtonListBox;
            prevPressed: sc.ModSettingsTabBox.TabButton;
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
            _createTabButton(this: this, title: string, x: number, categoryId: string, icon?: string): sc.ModSettingsTabBox.TabButton;
            onButtonTraversal(this: this): void;
            _resetButtons(this: this, tabButton?: sc.ModSettingsTabBox.TabButton, unfocus?: boolean): void;
            addObservers(this: this): void;
            removeObservers(this: this): void;
        }
        interface ModSettingsTabBoxConstructor extends ImpactClass<ModSettingsTabBox> {
            TabButton: sc.ModSettingsTabBox.TabButtonConstructor;
            new (): ModSettingsTabBox;
        }
        var ModSettingsTabBox: ModSettingsTabBoxConstructor;
    }
}
