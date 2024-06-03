import type { GuiOption } from '../../mod-options';
declare global {
    namespace sc {
        interface ModOptionsOptionRow extends sc.OptionRow {
            guiOption: GuiOption;
        }
        interface ModOptionsOptionRowConstructor extends ImpactClass<ModOptionsOptionRow> {
            new (option: GuiOption, row: number, rowGroup: sc.RowButtonGroup, width?: number, height?: number): ModOptionsOptionRow;
        }
        var ModOptionsOptionRow: ModOptionsOptionRowConstructor;
    }
}
