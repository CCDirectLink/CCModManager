import { GuiOption } from '../../mod-options';
declare global {
    namespace sc {
        interface ModOptionsOptionInfoBox extends ig.GuiElementBase {
            text: sc.TextGui;
            box: sc.CenterBoxGui;
        }
        interface ModOptionsOptionInfoBoxConstructor extends ImpactClass<ModOptionsOptionInfoBox> {
            new (option: GuiOption, width: number): ModOptionsOptionInfoBox;
        }
        var ModOptionsOptionInfoBox: ModOptionsOptionInfoBoxConstructor;
    }
}
declare global {
    namespace sc {
        interface ModOptionsOptionButton extends ig.GuiElementBase {
            option: GuiOption;
            button: sc.ButtonGui;
        }
        interface ModOptionsOptionButtonConstructor extends ImpactClass<ModOptionsOptionButton> {
            new (option: GuiOption, y: number, rowGroup: sc.RowButtonGroup, width: number): ModOptionsOptionButton;
        }
        var ModOptionsOptionButton: ModOptionsOptionButtonConstructor;
    }
}
