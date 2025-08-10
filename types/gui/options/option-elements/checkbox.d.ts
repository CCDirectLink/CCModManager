import { ModOptionsOptionConstructor, ModOptionsOptionElement } from './all';
declare global {
    namespace modmanager.gui.Options {
        interface CHECKBOX extends sc.OPTION_GUIS_DEFS.CHECKBOX, ModOptionsOptionElement<'CHECKBOX'> {
            currentNumber: sc.TextGui;
        }
        interface CHECKBOX_CONSTRUCTOR extends ImpactClass<CHECKBOX>, ModOptionsOptionConstructor<CHECKBOX, 'CHECKBOX'> {
        }
        var CHECKBOX: CHECKBOX_CONSTRUCTOR;
    }
}
