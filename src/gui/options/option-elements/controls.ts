import { ModOptionsOptionConstructor, ModOptionsOptionElement } from './all'

declare global {
    namespace modmanager.gui.Options {
        interface CONTROLS extends sc.OPTION_GUIS_DEFS.CONTROLS, ModOptionsOptionElement<'CONTROLS'> {
            currentNumber: sc.TextGui
        }
        interface CONTROLS_CONSTRUCTOR
            extends ImpactClass<CONTROLS>,
                ModOptionsOptionConstructor<CONTROLS, 'CONTROLS'> {}
        var CONTROLS: CONTROLS_CONSTRUCTOR
    }
}
modmanager.gui.Options.CONTROLS = sc.OPTION_GUIS[sc.OPTION_TYPES.CONTROLS].extend({
    init(optionRow, width, rowGroup) {
        this.guiOption = optionRow.guiOption

        const backup_ig_lang_get = ig.lang.get
        // @ts-expect-error
        ig.lang.get = (path: string, ...args) => {
            if (path == 'sc.gui.options.controls.none') return backup_ig_lang_get.call(ig.lang, path, ...args)
            if (path == 'sc.gui.options.controls.description') return this.guiOption.description
            if (path.startsWith('sc.gui.options.controls.keys.')) return this.guiOption.name
            throw new Error('what')
        }

        this.parent(optionRow, width, rowGroup)

        ig.lang.get = backup_ig_lang_get
    },
    getNameGuiInfo() {
        return { has: true }
    },
})
