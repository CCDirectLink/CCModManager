import { ModOptionsOptionConstructor, ModOptionsOptionElement } from './all';
declare global {
    namespace modmanager.gui.Options {
        interface INFO extends ig.GuiElementBase, ModOptionsOptionElement {
            text: sc.TextGui;
            box: sc.CenterBoxGui;
        }
        interface INFO_CONSTRUCTOR extends ImpactClass<INFO>, ModOptionsOptionConstructor<INFO> {
        }
        var INFO: INFO_CONSTRUCTOR;
    }
}
