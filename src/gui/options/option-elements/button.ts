import { ModOptionsOptionConstructor, ModOptionsOptionElement } from './all'

declare global {
    namespace modmanager.gui.Options {
        interface BUTTON extends ig.GuiElementBase, ModOptionsOptionElement<'BUTTON'> {
            button: sc.ButtonGui
        }
        interface BUTTON_CONSTRUCTOR extends ImpactClass<BUTTON>, ModOptionsOptionConstructor<BUTTON, 'BUTTON'> {}
        var BUTTON: BUTTON_CONSTRUCTOR
    }
}

modmanager.gui.Options.BUTTON = ig.GuiElementBase.extend({
    init(optionRow, _width, rowGroup) {
        this.parent()

        this.guiOption = optionRow.guiOption

        this.button = new sc.ButtonGui(this.guiOption.name)
        if (this.guiOption.onPress) {
            this.button.onButtonPress = () => {
                this.guiOption.onPress.call(this.guiOption)
            }
        }

        this.button.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER)

        const backup = this.button.focusGained.bind(this.button)
        this.button.data = this.guiOption.description
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
