import { ModOptionsOptionConstructor, ModOptionsOptionElement, optGet, optSet } from './all'

declare global {
    namespace modmanager.gui.Options {
        interface BUTTON_GROUP extends sc.OPTION_GUIS_DEFS.BUTTON_GROUP, ModOptionsOptionElement {}
        interface BUTTON_GROUP_CONSTRUCTOR
            extends ImpactClass<BUTTON_GROUP>,
                ModOptionsOptionConstructor<BUTTON_GROUP> {}
        var BUTTON_GROUP: BUTTON_GROUP_CONSTRUCTOR
    }
}

modmanager.gui.Options ??= {} as any
modmanager.gui.Options.BUTTON_GROUP = sc.OPTION_GUIS[sc.OPTION_TYPES.BUTTON_GROUP].extend({
    init(optionRow, width, rowGroup) {
        this.guiOption = (optionRow as modmanager.gui.OptionsOptionRow).guiOption

        const index = optGet(this.guiOption) as number

        const backup_ig_lang_get = ig.lang.get
        // @ts-expect-error
        ig.lang.get = (): string[] => {
            if (!(optionRow instanceof modmanager.gui.OptionsOptionRow)) throw new Error('what')
            if (optionRow.guiOption.type != 'BUTTON_GROUP') throw new Error('what')

            return optionRow.guiOption.buttonNames ?? []
        }
        const backup_sc_options_get = sc.options.get
        sc.options.get = () => index

        this.parent(optionRow, width, rowGroup)

        ig.lang.get = backup_ig_lang_get
        sc.options.get = backup_sc_options_get
    },
    getNameGuiInfo() {
        return { has: true, padding: true }
    },
    onPressed(button) {
        if (this._prevPressed != button) {
            this.resetButtons(button)
            optSet(this.guiOption, button.data.id)
            this._prevPressed = button
        }
    },
    /* theres no need to listen to sc.OPTIONS_EVENT.OPTION_CHANGED since sc.options.set does
     * not reffer to ccmodmanager options */
    onAttach() {},
})
