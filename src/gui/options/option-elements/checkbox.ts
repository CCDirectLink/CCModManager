import { ModOptionsOptionConstructor, ModOptionsOptionElement, optGet, optSet } from './all'

declare global {
    namespace modmanager.gui.Options {
        interface CHECKBOX extends sc.OPTION_GUIS_DEFS.CHECKBOX, ModOptionsOptionElement<'CHECKBOX'> {
            currentNumber: sc.TextGui
        }
        interface CHECKBOX_CONSTRUCTOR
            extends ImpactClass<CHECKBOX>,
                ModOptionsOptionConstructor<CHECKBOX, 'CHECKBOX'> {}
        var CHECKBOX: CHECKBOX_CONSTRUCTOR
    }
}

modmanager.gui.Options.CHECKBOX = sc.OPTION_GUIS[sc.OPTION_TYPES.CHECKBOX].extend({
    init(optionRow, width, rowGroup) {
        this.parent(optionRow, width, rowGroup)

        this.guiOption = optionRow.guiOption

        this.button.setPressed(optGet(this.guiOption) as boolean)
    },
    getNameGuiInfo() {
        return { has: true }
    },
    onPressed(checkbox) {
        checkbox == this.button && optSet(this.guiOption, checkbox.pressed)
    },
    onAttach() {},
})
