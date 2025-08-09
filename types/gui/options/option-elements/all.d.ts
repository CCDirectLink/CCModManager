import { GuiOption } from '../../../mod-options';
declare global {
    namespace modmanager.gui.Options { }
}
import './button-group';
import './button';
import './checkbox';
import './controls';
import './info';
import './input-field';
import './object-slider';
export interface ModOptionsOptionElement {
    guiOption: GuiOption;
    getNameGuiInfo(this: this): {
        has: boolean;
    };
}
export interface ModOptionsOptionConstructor<T extends ModOptionsOptionElement> {
    new (optionRow: modmanager.gui.OptionsOptionRow, width: number, rowGroup: sc.RowButtonGroup): T;
}
export declare function optGet(guiOption: GuiOption): unknown;
export declare function optSet(guiOption: GuiOption, value: any): void;
