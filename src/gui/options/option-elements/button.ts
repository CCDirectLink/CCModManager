import { ModOptionsOptionConstructor, ModOptionsOptionElement } from './all'

declare global {
    namespace modmanager.gui.Options {
        interface BUTTON extends ig.GuiElementBase, ModOptionsOptionElement {
            button: sc.ButtonGui
        }
        interface BUTTON_CONSTRUCTOR extends ImpactClass<BUTTON>, ModOptionsOptionConstructor<BUTTON> {}
        var BUTTON: BUTTON_CONSTRUCTOR
    }
}

modmanager.gui.Options.BUTTON = ig.GuiElementBase.extend({
    init(optionRow, _width, rowGroup) {
        this.parent()

        const option = (optionRow as modmanager.gui.OptionsOptionRow).guiOption
        this.guiOption = option
        if (option.type != 'BUTTON') throw new Error('how')

        this.button = new sc.ButtonGui(option.name)
        if (option.onPress) {
            this.button.onButtonPress = () => {
                option.onPress.call(option, this.button)
            }
        }

        this.button.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER)

        const backup = this.button.focusGained.bind(this.button)
        this.button.data = option.description
        this.button.focusGained = function (this: sc.ButtonGui) {
            backup()
            sc.menu.setInfoText(this.data as string)
        }

        this.addChildGui(this.button)
        rowGroup.addFocusGui(this.button, 0, optionRow.row)
    },
    getNameGuiInfo() {
        return { has: false }
    },
})
