import { GuiOption } from '../../mod-options';
declare global {
    namespace modmanager.gui {
        interface OptionsOptionInfoBox extends ig.GuiElementBase {
            text: sc.TextGui;
            box: sc.CenterBoxGui;
        }
        interface OptionsOptionInfoBoxConstructor extends ImpactClass<OptionsOptionInfoBox> {
            new (option: GuiOption, width: number): OptionsOptionInfoBox;
        }
        var OptionsOptionInfoBox: OptionsOptionInfoBoxConstructor;
    }
}
declare global {
    namespace modmanager.gui {
        interface OptionsOptionButton extends ig.GuiElementBase {
            option: GuiOption;
            button: sc.ButtonGui;
        }
        interface OptionsOptionButtonConstructor extends ImpactClass<OptionsOptionButton> {
            new (option: GuiOption, y: number, rowGroup: sc.RowButtonGroup, width: number): OptionsOptionButton;
        }
        var OptionsOptionButton: OptionsOptionButtonConstructor;
    }
}
