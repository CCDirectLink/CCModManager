import type { GuiOption, OptionVisibleTypes } from '../../mod-options';
import './option-elements/all';
declare global {
    namespace modmanager.gui {
        interface OptionsOptionRow<T extends OptionVisibleTypes = OptionVisibleTypes> extends sc.OptionRow {
            guiOption: GuiOption<T>;
        }
        interface OptionsOptionRowConstructor extends ImpactClass<OptionsOptionRow> {
            new <T extends OptionVisibleTypes>(option: GuiOption<T>, row: number, rowGroup: sc.RowButtonGroup, width: number, height?: number): OptionsOptionRow<T>;
        }
        var OptionsOptionRow: OptionsOptionRowConstructor;
    }
}
