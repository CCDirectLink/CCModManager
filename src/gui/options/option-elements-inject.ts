import { GuiOption } from '../../mod-options'

const optGet = (row: sc.ModOptionsOptionRow): unknown => {
    return sc.modMenu.options[row.guiOption.modId][row.guiOption.baseId]
}
const optSet = (row: sc.ModOptionsOptionRow, value: any) => {
    sc.modMenu.options[row.guiOption.modId][row.guiOption.baseId] = value
}

sc.OPTION_GUIS[sc.OPTION_TYPES.BUTTON_GROUP].inject({
    init(optionRow, x, rowGroup) {
        this.base = optionRow
        if (!(this.base instanceof sc.ModOptionsOptionRow)) return this.parent(optionRow, x, rowGroup)

        const index = optGet(this.base) as number

        const backup_ig_lang_get = ig.lang.get
        // @ts-expect-error
        ig.lang.get = (): string[] => {
            if (!(optionRow instanceof sc.ModOptionsOptionRow)) throw new Error('what')
            if (optionRow.guiOption.type != 'BUTTON_GROUP') throw new Error('what')

            return optionRow.guiOption.buttonNames ?? []
        }
        const backup_sc_options_get = sc.options.get
        sc.options.get = () => index

        this.parent(optionRow, x, rowGroup)

        ig.lang.get = backup_ig_lang_get
        sc.options.get = backup_sc_options_get
    },
    onPressed(button) {
        if (!(this.base instanceof sc.ModOptionsOptionRow)) return this.parent
        if (this._prevPressed != button) {
            this.resetButtons(button)
            optSet(this.base, button.data.id)
            this._prevPressed = button
        }
    },
})

sc.OPTION_GUIS[sc.OPTION_TYPES.OBJECT_SLIDER].inject({
    init(optionRow, x, rowGroup) {
        this.parent(optionRow, x, rowGroup)
        if (!(this.base instanceof sc.ModOptionsOptionRow)) return

        const value = optGet(this.base) as number
        const index = this.entries.findIndex(v => v == value)
        this.slider.setValue(index)
        this.onChange(index)
    },
    onChange(index) {
        if (!(this.base instanceof sc.ModOptionsOptionRow)) return this.parent(index)

        if (index != this._lastVal) {
            this._lastVal = index
            this.updateNumberDisplay()
            optSet(this.base, this.entries[index])
        }
    },
    modelChanged(model, message, data) {
        if (!(this.base instanceof sc.ModOptionsOptionRow)) return this.parent(model, message, data)

        if (model == sc.options && message == sc.OPTIONS_EVENT.OPTION_CHANGED) {
            const value = optGet(this.base) as number
            if (value != this.entries[this._lastVal]) {
                this._lastVal = this.entries.indexOf(value)
                this.slider.setValue(this._lastVal)
                this.updateNumberDisplay()
            }
        }
    },
    onLeftRight(direction) {
        const val = direction ? this._lastVal + 1 : this._lastVal - 1
        this.slider.setValue(val)
        this.onChange(this.slider.getValue())
    },
})

sc.OPTION_GUIS[sc.OPTION_TYPES.ARRAY_SLIDER].inject({
    init(optionRow, x, rowGroup) {
        this.parent(optionRow, x, rowGroup)
        if (!(this.base instanceof sc.ModOptionsOptionRow)) return

        const value = optGet(this.base) as number
        this.slider.setValue(value * this.scale)
        this._lastVal = this.slider.getValue()
    },
    onLeftRight(direction) {
        this.parent(direction)

        if (!(this.base instanceof sc.ModOptionsOptionRow)) return

        optSet(this.base, this._lastVal / this.scale)
    },
})

sc.OPTION_GUIS[sc.OPTION_TYPES.CHECKBOX].inject({
    init(optionRow, x, rowGroup) {
        this.parent(optionRow, x, rowGroup)

        if (!(this.base instanceof sc.ModOptionsOptionRow)) return

        this.button.setPressed(optGet(this.base) as boolean)
    },
    onPressed(checkbox) {
        if (!(this.base instanceof sc.ModOptionsOptionRow)) return this.parent(checkbox)

        checkbox == this.button && optSet(this.base, checkbox.pressed)
    },
})

export {}
declare global {
    namespace sc {
        interface ModOptionsOptionInfoBox extends ig.GuiElementBase {
            text: sc.TextGui
            box: sc.CenterBoxGui
        }
        interface ModOptionsOptionInfoBoxConstructor extends ImpactClass<ModOptionsOptionInfoBox> {
            new (option: GuiOption, width: number): ModOptionsOptionInfoBox
        }
        var ModOptionsOptionInfoBox: ModOptionsOptionInfoBoxConstructor
    }
}

sc.ModOptionsOptionInfoBox = ig.GuiElementBase.extend({
    init(option, width) {
        this.parent()
        this.text = new sc.TextGui(option.name, { maxWidth: width - 36, font: sc.fontsystem.smallFont })
        const element = new ig.GuiElementBase()
        element.setSize(width - 36, this.text.hook.size.y)
        element.addChildGui(this.text)
        this.box = new sc.CenterBoxGui(element, true)
        this.box.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP)
        this.box.setPos(1, 0)
        this.addChildGui(this.box)
        this.setSize(width ?? 400, this.box.hook.size.y - 5)
    },
})

declare global {
    namespace sc {
        interface ModOptionsOptionButton extends ig.GuiElementBase {
            option: GuiOption
            button: sc.ButtonGui
        }
        interface ModOptionsOptionButtonConstructor extends ImpactClass<ModOptionsOptionButton> {
            new (option: GuiOption, y: number, rowGroup: sc.RowButtonGroup, width: number): ModOptionsOptionButton
        }
        var ModOptionsOptionButton: ModOptionsOptionButtonConstructor
    }
}

sc.ModOptionsOptionButton = ig.GuiElementBase.extend({
    init(option, y, rowGroup, width) {
        this.parent()
        this.option = option
        if (option.type != 'BUTTON') throw new Error('how')

        // this.box = new sc.CenterBoxGui(element, true)
        // this.box.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP)
        // this.box.setPos(1, 0)
        // this.addChildGui(this.box)

        this.button = new sc.ButtonGui(option.name)
        if (option.onPress) {
            this.button.onButtonPress = option.onPress
        }

        // this.button.setPos(5, 8)
        this.button.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER)

        const backup = this.button.focusGained.bind(this.button)
        this.button.data = option.description
        this.button.focusGained = function (this: sc.ButtonGui) {
            backup()
            sc.menu.setInfoText(this.data as string)
        }
        this.setSize(width, this.button.hook.size.y - 5)

        this.addChildGui(this.button)

        rowGroup.addFocusGui(this.button, 0, y)
    },
})
