import { ModOptionsOptionConstructor, ModOptionsOptionElement } from './all'

declare global {
    namespace modmanager.gui.Options {
        interface INFO extends ig.GuiElementBase, ModOptionsOptionElement<'INFO'> {
            text: sc.TextGui
            box: sc.CenterBoxGui
        }
        interface INFO_CONSTRUCTOR extends ImpactClass<INFO>, ModOptionsOptionConstructor<INFO, 'INFO'> {}
        var INFO: INFO_CONSTRUCTOR
    }
}

modmanager.gui.Options.INFO = ig.GuiElementBase.extend({
    init(optionRow, width, _rowGroup) {
        this.parent()

        this.guiOption = optionRow.guiOption

        this.text = new sc.TextGui(this.guiOption.name, { maxWidth: width - 36, font: sc.fontsystem.smallFont })
        const height = this.text.hook.size.y

        const element = new ig.GuiElementBase()
        element.setSize(width - 36, height)
        element.addChildGui(this.text)
        this.box = new sc.CenterBoxGui(element, true)
        this.box.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP)
        this.box.setPos(1, 0)
        this.addChildGui(this.box)
        this.setSize(width, this.box.hook.size.y - 5)
    },
    getNameGuiInfo() {
        return { has: false }
    },
})
