import { ModOptionsOptionConstructor, ModOptionsOptionElement } from './all';
declare global {
    namespace modmanager.gui.Options {
        interface BUTTON extends ig.GuiElementBase, ModOptionsOptionElement<'BUTTON'> {
            button: sc.ButtonGui;
        }
        interface BUTTON_CONSTRUCTOR extends ImpactClass<BUTTON>, ModOptionsOptionConstructor<BUTTON, 'BUTTON'> {
        }
        var BUTTON: BUTTON_CONSTRUCTOR;
    }
}
