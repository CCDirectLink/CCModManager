import { GuiOption, OptionVisibleTypes } from '../../../mod-options';
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
export interface ModOptionsOptionElement<T extends OptionVisibleTypes> {
    guiOption: GuiOption<T>;
    getNameGuiInfo(this: this): {
        has: boolean;
    };
}
export interface ModOptionsOptionConstructor<E extends ModOptionsOptionElement<T>, T extends OptionVisibleTypes> {
    new (optionRow: modmanager.gui.OptionsOptionRow<T>, width: number, rowGroup: sc.RowButtonGroup): E;
}
export declare function optGet(guiOption: GuiOption): unknown;
export declare function optSet(guiOption: GuiOption, value: any): void;
