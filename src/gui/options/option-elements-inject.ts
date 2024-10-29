import { GuiOption } from '../../mod-options'

const optGet = (row: modmanager.gui.OptionsOptionRow): unknown => {
    return modmanager.options[row.guiOption.modId][row.guiOption.baseId]
}
const optSet = (row: modmanager.gui.OptionsOptionRow, value: any) => {
    modmanager.options[row.guiOption.modId][row.guiOption.baseId] = value
}

sc.OPTION_GUIS[sc.OPTION_TYPES.BUTTON_GROUP].inject({
    init(optionRow, x, rowGroup) {
        this.base = optionRow
        if (!(this.base instanceof modmanager.gui.OptionsOptionRow)) return this.parent(optionRow, x, rowGroup)

        const index = optGet(this.base) as number

        const backup_ig_lang_get = ig.lang.get
        // @ts-expect-error
        ig.lang.get = (): string[] => {
            if (!(optionRow instanceof modmanager.gui.OptionsOptionRow)) throw new Error('what')
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
        if (!(this.base instanceof modmanager.gui.OptionsOptionRow)) return this.parent(button)
        if (this._prevPressed != button) {
            this.resetButtons(button)
            optSet(this.base, button.data.id)
            this._prevPressed = button
        }
    },
})

declare global {
    namespace modmanager.gui {
        interface OptionsObjectSlider extends sc.OPTION_GUIS_DEFS.OBJECT_SLIDER {
            base: modmanager.gui.OptionsOptionRow
            currentNumber: sc.TextGui
        }
        interface OptionsObjectSliderConstructor extends ImpactClass<OptionsObjectSlider> {
            new (optionRow: sc.OptionRow, x: number, rowGroup: sc.RowButtonGroup): OptionsObjectSlider
        }
        var OptionsObjectSlider: OptionsObjectSliderConstructor
    }
}
modmanager.gui.OptionsObjectSlider = ig.GuiElementBase.extend({
    entries: [],
    _lastVal: -1,
    init(optionRow, x, rowGroup) {
        this.parent()
        this.base = optionRow as modmanager.gui.OptionsOptionRow

        if (this.base.guiOption.type != 'OBJECT_SLIDER') throw new Error('what')

        const snap = (!('snap' in this.base.option) || this.base.option.snap) ?? true

        const data = this.base.guiOption.data
        this.entries = Object.values(data!)
        x -= 4
        this.showPercentage = this.base.guiOption.showPercentage

        this.slider = new sc.OptionFocusSlider(this.onChange.bind(this), snap, this.base.guiOption.fill, rowGroup)
        this.slider.setPreferredThumbSize(Math.floor(x / this.entries.length), 21)
        this.slider.setPos(0, 0)
        this.slider.setMinMaxValue(0, this.entries.length - 1)
        this.slider.setSize(x - 4, 21, 9)
        this.slider.data = this.base.optionDes
        this.addChildGui(this.slider)
        this.currentNumber = new sc.TextGui('')
        this.currentNumber.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER)
        this.slider.thumb.addChildGui(this.currentNumber)
        rowGroup.addFocusGui(this.slider, 0, this.base.row)

        const value = optGet(this.base) as number
        let index = this.entries.findIndex(v => v == value)
        if (index == -1) index = 0
        this.slider.setValue(index)
        this.onChange(index)
    },
    updateNumberDisplay() {
        if (this.base.guiOption.type != 'OBJECT_SLIDER') throw new Error('what')

        const func = this.base.guiOption.customNumberDisplay
        if (func) {
            let ret = func.bind(this.base.guiOption)(this._lastVal)
            if (typeof ret == 'number') {
                ret = ret.round(3)
            }
            this.currentNumber.setText(ret.toString())
            return
        }

        if (this.showPercentage) {
            const text = Math.round(this.entries[this._lastVal] * 100) + '%'
            this.currentNumber.setText(text)
        } else {
            const num = this._lastVal + 1
            this.currentNumber.setText(num.round(3).toString())
        }
    },
    onAttach() {
        sc.Model.addObserver(sc.options, this)
    },
    onDetach() {
        sc.Model.removeObserver(sc.options, this)
    },
    modelChanged(model, message) {
        if (model == sc.options && message == sc.OPTIONS_EVENT.OPTION_CHANGED) {
            const value = optGet(this.base) as number
            if (value != this.entries[this._lastVal]) {
                this._lastVal = this.entries.indexOf(value)
                this.slider.setValue(this._lastVal)
                this.updateNumberDisplay()
            }
        }
    },
    onChange(index) {
        if (index != this._lastVal) {
            this._lastVal = index
            this.updateNumberDisplay()
            optSet(this.base, this.entries[index])
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
        if (!(this.base instanceof modmanager.gui.OptionsOptionRow)) return

        const value = optGet(this.base) as number
        this.slider.setValue(value * this.scale)
        this._lastVal = this.slider.getValue()
    },
    onLeftRight(direction) {
        this.parent(direction)

        if (!(this.base instanceof modmanager.gui.OptionsOptionRow)) return

        optSet(this.base, this._lastVal / this.scale)
    },
})

sc.OPTION_GUIS[sc.OPTION_TYPES.CHECKBOX].inject({
    init(optionRow, x, rowGroup) {
        this.parent(optionRow, x, rowGroup)

        if (!(this.base instanceof modmanager.gui.OptionsOptionRow)) return

        this.button.setPressed(optGet(this.base) as boolean)
    },
    onPressed(checkbox) {
        if (!(this.base instanceof modmanager.gui.OptionsOptionRow)) return this.parent(checkbox)

        checkbox == this.button && optSet(this.base, checkbox.pressed)
    },
})

declare global {
    namespace modmanager.gui {
        interface OptionsOptionInfoBox extends ig.GuiElementBase {
            text: sc.TextGui
            box: sc.CenterBoxGui
        }
        interface OptionsOptionInfoBoxConstructor extends ImpactClass<OptionsOptionInfoBox> {
            new (option: GuiOption, width: number): OptionsOptionInfoBox
        }
        var OptionsOptionInfoBox: OptionsOptionInfoBoxConstructor
    }
}

modmanager.gui.OptionsOptionInfoBox = ig.GuiElementBase.extend({
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
    namespace modmanager.gui {
        interface OptionsOptionButton extends ig.GuiElementBase {
            option: GuiOption
            button: sc.ButtonGui
        }
        interface OptionsOptionButtonConstructor extends ImpactClass<OptionsOptionButton> {
            new (option: GuiOption, y: number, rowGroup: sc.RowButtonGroup, width: number): OptionsOptionButton
        }
        var OptionsOptionButton: OptionsOptionButtonConstructor
    }
}

modmanager.gui.OptionsOptionButton = ig.GuiElementBase.extend({
    init(option, y, rowGroup, width) {
        this.parent()
        this.option = option
        if (option.type != 'BUTTON') throw new Error('how')

        this.button = new sc.ButtonGui(option.name)
        if (option.onPress) {
            this.button.onButtonPress = option.onPress.bind(option)
        }

        // this.button.setPos(5, 8)
        this.button.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER)

        const backup = this.button.focusGained.bind(this.button)
        this.button.data = option.description
        this.button.focusGained = function (this: sc.ButtonGui) {
            backup()
            sc.menu.setInfoText(this.data as string)
        }
        this.setSize(width, this.button.hook.size.y)

        this.addChildGui(this.button)

        rowGroup.addFocusGui(this.button, 0, y)
    },
})

sc.OPTION_GUIS[sc.OPTION_TYPES.CONTROLS].inject({
    init(optionRow, x, rowGroup) {
        if (!(optionRow instanceof modmanager.gui.OptionsOptionRow)) return this.parent(optionRow, x, rowGroup)

        const backup_ig_lang_get = ig.lang.get
        // @ts-expect-error
        ig.lang.get = (path: string, ...args) => {
            if (!(optionRow instanceof modmanager.gui.OptionsOptionRow)) throw new Error('what')
            if (path == 'sc.gui.options.controls.none') return backup_ig_lang_get.bind(ig.lang)(path, ...args)
            if (path == 'sc.gui.options.controls.description') return optionRow.guiOption.description
            if (path.startsWith('sc.gui.options.controls.keys.')) return optionRow.guiOption.name
            throw new Error('what')
        }

        this.parent(optionRow, x, rowGroup)

        ig.lang.get = backup_ig_lang_get
    },
})
