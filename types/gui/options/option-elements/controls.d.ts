import { ModOptionsOptionConstructor, ModOptionsOptionElement } from './all';
declare global {
    namespace modmanager.gui.Options {
        interface CONTROLS extends sc.OPTION_GUIS_DEFS.CONTROLS, ModOptionsOptionElement<'CONTROLS'> {
            currentNumber: sc.TextGui;
        }
        interface CONTROLS_CONSTRUCTOR extends ImpactClass<CONTROLS>, ModOptionsOptionConstructor<CONTROLS, 'CONTROLS'> {
        }
        var CONTROLS: CONTROLS_CONSTRUCTOR;
    }
}
