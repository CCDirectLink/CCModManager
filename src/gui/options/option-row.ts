import type { GuiOption } from '../../mod-options'

declare global {
    namespace modmanager.gui {
        interface ModOptionsOptionRow extends sc.OptionRow {
            guiOption: GuiOption
        }
        interface ModOptionsOptionRowConstructor extends ImpactClass<ModOptionsOptionRow> {
            new (option: GuiOption, row: number, rowGroup: sc.RowButtonGroup, width?: number, height?: number): ModOptionsOptionRow
        }
        var ModOptionsOptionRow: ModOptionsOptionRowConstructor
    }
}
modmanager.gui.ModOptionsOptionRow = sc.OptionRow.extend({
    init(option, row, rowGroup, width, height) {
        ig.GuiElementBase.prototype.init.call(this)

        this.setSize(width || 400, height || 26)
        this._rowGroup = rowGroup
        this.local = false
        this.option = option as unknown as sc.OptionDefinition
        this.guiOption = option
        this.optionName = option.id
        this.optionDes = option.description
        this.row = row

        this.nameGui = new sc.TextGui(option.name)
        this.nameGui.setPos(5, 4)
        this.addChildGui(this.nameGui)

        const colorGui = new ig.ColorGui('#545454', 166, 1)
        colorGui.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_BOTTOM)
        colorGui.setPos(0, 4)
        this.addChildGui(colorGui)

        const imageGui = new ig.ImageGui(this.gfx, 32, 416, 8, 8)
        imageGui.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_BOTTOM)
        imageGui.setPos(colorGui.hook.size.x, 3)
        this.addChildGui(imageGui)

        const x = this.hook.size.x - 175
        const optionType = sc.OPTION_TYPES[this.option.type] as 0 | 1 | 2 | 3 | 4 | 5 /* <- all sc.OPTION_TYPES values expect sc.OPTION_TYPES.INFO */
        const optionClass = sc.OPTION_GUIS[optionType]
        if (optionClass) {
            const typeGui: ig.GuiElementBase = new optionClass(this as unknown as sc.OptionRow, x, rowGroup)
            this.typeGui = typeGui as any
            typeGui.setSize(x, 26)
            typeGui.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_BOTTOM)
            typeGui.setPos(175, 0)
            this.addChildGui(this.typeGui)
        } else {
            const textGui = new sc.TextGui('Missing Option Type: ' + this.option.type)
            textGui.setPos(175, 4)
            this.addChildGui(textGui)
        }
        if (this.option.hasDivider) {
            this.divider = true
            this.hook.size.y = this.hook.size.y + 17
            const textGui = new sc.TextGui(option.header, { font: sc.fontsystem.tinyFont })
            textGui.setPos(2, 6)
            this.addChildGui(textGui)
            this.nameGui.setPos(5, 21)
        }
        this.hook.setMouseRecord(true)
    },
})
