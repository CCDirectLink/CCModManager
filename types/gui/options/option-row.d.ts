import type { GuiOption } from '../../mod-options';
declare global {
    namespace modmanager.gui {
        interface OptionsOptionRow extends sc.OptionRow {
            guiOption: GuiOption;
        }
        interface OptionsOptionRowConstructor extends ImpactClass<OptionsOptionRow> {
            new (option: GuiOption, row: number, rowGroup: sc.RowButtonGroup, width?: number, height?: number): OptionsOptionRow;
        }
        var OptionsOptionRow: OptionsOptionRowConstructor;
    }
}
