import type { GuiOption } from '../../mod-options'
import { ModOptionsOptionElement } from './option-elements/all'
import './option-elements/all'

declare global {
    namespace modmanager.gui {
        interface OptionsOptionRow extends sc.OptionRow {
            guiOption: GuiOption
        }
        interface OptionsOptionRowConstructor extends ImpactClass<OptionsOptionRow> {
            new (
                option: GuiOption,
                row: number,
                rowGroup: sc.RowButtonGroup,
                width: number,
                height?: number
            ): OptionsOptionRow
        }
        var OptionsOptionRow: OptionsOptionRowConstructor
    }
}
modmanager.gui.OptionsOptionRow = sc.OptionRow.extend({
    init(option, row, rowGroup, width, height = 26) {
        ig.GuiElementBase.prototype.init.call(this)

        this.setSize(width, height)
        this._rowGroup = rowGroup
        this.local = false
        this.option = option as unknown as sc.OptionDefinition
        this.guiOption = option
        this.optionName = option.id
        this.optionDes = option.description
        this.row = row

        const clazz = modmanager.gui.Options[option.type as Exclude<typeof option.type, 'ARRAY_SLIDER' | 'JSON_DATA'>]
        let { has: hasNameGui } = (clazz.prototype as ModOptionsOptionElement).getNameGuiInfo()
        hasNameGui &&= !!option.name

        const nameGuiPadding: boolean = !option.noNamePadding

        const baseX = 5
        let x = baseX
        let optionWidth = width

        if (hasNameGui) {
            this.nameGui = new sc.TextGui(option.name)
            this.nameGui.setPos(baseX, 4)
            this.addChildGui(this.nameGui)
            x += nameGuiPadding ? 171 : this.nameGui.hook.size.x + 9

            const colorGui = new ig.ColorGui('#545454', x - 9, 1)
            colorGui.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_BOTTOM)
            colorGui.setPos(0, 4)
            this.addChildGui(colorGui)

            const imageGui = new ig.ImageGui(this.gfx, 32, 416, 8, 8)
            imageGui.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_BOTTOM)
            imageGui.setPos(colorGui.hook.size.x, 3)
            this.addChildGui(imageGui)

            optionWidth -= x - baseX
        }

        if (clazz) {
            const typeGui: ig.GuiElementBase = new clazz(this, optionWidth, rowGroup)
            this.typeGui = typeGui as any
            typeGui.setSize(optionWidth, Math.max(26, typeGui.hook.size.y))
            typeGui.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_BOTTOM)
            typeGui.setPos(x, 0)
            this.addChildGui(this.typeGui)
            this.setSize(width, typeGui.hook.size.y)
        } else {
            const textGui = new sc.TextGui('Missing Option Type: ' + this.option.type)
            textGui.setPos(x, 4)
            this.addChildGui(textGui)
        }

        if (this.option.hasDivider) {
            this.divider = true
            this.hook.size.y += 17
            const textGui = new sc.TextGui(option.header, { font: sc.fontsystem.tinyFont })
            textGui.setPos(2, 6)
            this.addChildGui(textGui)
            this.nameGui?.setPos(baseX, 21)
        }
        this.hook.setMouseRecord(true)
    },
    updateDrawables(renderer) {
        /* fix divider y getting set based of the height instead of just being a predefined value */
        /*                                    change here vv */
        if (this.divider) renderer.addColor('#545454', 0, 14, this.hook.size.x + 2, 1)
    },
})
