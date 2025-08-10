import { ModOptionsOptionConstructor, ModOptionsOptionElement } from './all';
declare global {
    namespace modmanager.gui.Options {
        interface BUTTON_GROUP extends sc.OPTION_GUIS_DEFS.BUTTON_GROUP, ModOptionsOptionElement<'BUTTON_GROUP'> {
        }
        interface BUTTON_GROUP_CONSTRUCTOR extends ImpactClass<BUTTON_GROUP>, ModOptionsOptionConstructor<BUTTON_GROUP, 'BUTTON_GROUP'> {
        }
        var BUTTON_GROUP: BUTTON_GROUP_CONSTRUCTOR;
    }
}
