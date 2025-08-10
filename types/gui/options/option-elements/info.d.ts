import { ModOptionsOptionConstructor, ModOptionsOptionElement } from './all';
declare global {
    namespace modmanager.gui.Options {
        interface INFO extends ig.GuiElementBase, ModOptionsOptionElement<'INFO'> {
            text: sc.TextGui;
            box: sc.CenterBoxGui;
        }
        interface INFO_CONSTRUCTOR extends ImpactClass<INFO>, ModOptionsOptionConstructor<INFO, 'INFO'> {
        }
        var INFO: INFO_CONSTRUCTOR;
    }
}
