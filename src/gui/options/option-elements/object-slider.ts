import { ModOptionsOptionConstructor, ModOptionsOptionElement, optGet, optSet } from './all'

declare global {
    namespace modmanager.gui.Options {
        interface OBJECT_SLIDER extends sc.OPTION_GUIS_DEFS.OBJECT_SLIDER, ModOptionsOptionElement {
            currentNumber: sc.TextGui
        }
        interface OBJECT_SLIDER_CONSTRUCTOR
            extends ImpactClass<OBJECT_SLIDER>,
                ModOptionsOptionConstructor<OBJECT_SLIDER> {}
        var OBJECT_SLIDER: OBJECT_SLIDER_CONSTRUCTOR
    }
}
modmanager.gui.Options.OBJECT_SLIDER = ig.GuiElementBase.extend({
    entries: [],
    _lastVal: -1,
    init(optionRow, width, rowGroup) {
        this.parent()

        this.guiOption = (optionRow as modmanager.gui.OptionsOptionRow).guiOption
        this.base = optionRow as modmanager.gui.OptionsOptionRow

        if (this.guiOption.type != 'OBJECT_SLIDER') throw new Error('what')

        const snap = (!('snap' in this.base.option) || this.base.option.snap) ?? true

        const data = this.guiOption.data
        this.entries = Object.values(data!)
        width -= 4
        this.showPercentage = this.guiOption.showPercentage

        this.slider = new sc.OptionFocusSlider(this.onChange.bind(this), snap, this.guiOption.fill, rowGroup)

        this.slider.setPreferredThumbSize(
            Math.max(30, this.guiOption.thumbWidth ?? Math.floor(252 / this.entries.length)),
            21
        )

        this.slider.setPos(0, 0)
        this.slider.setMinMaxValue(0, this.entries.length - 1)
        this.slider.setSize(width - 4, 21, 9)
        this.slider.data = this.base.optionDes
        this.addChildGui(this.slider)
        this.currentNumber = new sc.TextGui('')
        this.currentNumber.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER)
        this.slider.thumb.addChildGui(this.currentNumber)
        rowGroup.addFocusGui(this.slider, 0, this.base.row)

        const value = optGet(this.guiOption) as number
        let index = this.entries.findIndex(v => v == value)
        if (index == -1) index = 0
        this.slider.setValue(index)
        this.onChange(index)
    },
    getNameGuiInfo() {
        return { has: true }
    },
    updateNumberDisplay() {
        if (this.guiOption.type != 'OBJECT_SLIDER') throw new Error('what')

        const func = this.guiOption.customNumberDisplay
        if (func) {
            let ret = func.call(this.guiOption, this._lastVal)
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
    onChange(index) {
        if (index != this._lastVal) {
            this._lastVal = index
            this.updateNumberDisplay()
            optSet(this.guiOption, this.entries[index])
        }
    },
    onLeftRight(direction) {
        const val = direction ? this._lastVal + 1 : this._lastVal - 1
        this.slider.setValue(val)
        this.onChange(this.slider.getValue())
    },
})
