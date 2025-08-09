import { ModOptionsOptionConstructor, ModOptionsOptionElement } from './all';
declare global {
    namespace modmanager.gui.Options {
        interface OBJECT_SLIDER extends sc.OPTION_GUIS_DEFS.OBJECT_SLIDER, ModOptionsOptionElement {
            currentNumber: sc.TextGui;
        }
        interface OBJECT_SLIDER_CONSTRUCTOR extends ImpactClass<OBJECT_SLIDER>, ModOptionsOptionConstructor<OBJECT_SLIDER> {
        }
        var OBJECT_SLIDER: OBJECT_SLIDER_CONSTRUCTOR;
    }
}
