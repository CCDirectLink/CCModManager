import type { ModSettingsGui } from '../../mod-options';
import { ModEntry } from '../../types';
export {};
declare global {
    namespace modmanager.gui {
        namespace OptionsTabBox {
            type GuiOption = sc.OptionInfoBox | modmanager.gui.OptionsOptionRow | modmanager.gui.OptionsOptionButton | modmanager.gui.OptionsOptionInputField;
        }
        interface OptionsTabBox extends ig.GuiElementBase, sc.Model.Observer {
            gfx: ig.Image;
            mod: ModEntry;
            conf: ModSettingsGui;
            opts: Record<string, any>;
            currentTab: number;
            lastButtonData: modmanager.gui.OptionsTabBox.TabButton['data'];
            prevIndex: number;
            tabs: Record<string, modmanager.gui.OptionsTabBox.TabButton>;
            tabArray: modmanager.gui.OptionsTabBox.TabButton[];
            tabGroup: sc.ButtonGroup;
            rows: modmanager.gui.OptionsTabBox.GuiOption[];
            rowButtonGroup: sc.RowButtonGroup;
            tabContent: {
                buttonGroup: Nullable<modmanager.gui.OptionsTabBox['rowButtonGroup']>;
                list: Nullable<modmanager.gui.OptionsTabBox['list']>;
                rows: Nullable<modmanager.gui.OptionsTabBox['rows']>;
            }[];
            list: sc.ButtonListBox;
            prevPressed: modmanager.gui.OptionsTabBox.TabButton;
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
            _createTabButton(this: this, title: string, x: number, categoryId: string, icon?: string): modmanager.gui.OptionsTabBox.TabButton;
            onButtonTraversal(this: this): void;
            _resetButtons(this: this, tabButton?: modmanager.gui.OptionsTabBox.TabButton, unfocus?: boolean): void;
            setCurrentTab(this: this, tabIndex: number, noSound?: boolean): void;
            addObservers(this: this): void;
            removeObservers(this: this): void;
        }
        interface OptionsTabBoxConstructor extends ImpactClass<OptionsTabBox> {
            TabButton: modmanager.gui.OptionsTabBox.TabButtonConstructor;
            new (): OptionsTabBox;
        }
        var OptionsTabBox: OptionsTabBoxConstructor;
    }
}
