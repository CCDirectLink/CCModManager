import { InputFieldIsValidFunc } from '../../../mod-options'
import { ModOptionsOptionConstructor, ModOptionsOptionElement, optGet, optSet } from './all'

declare global {
    namespace modmanager.gui {
        interface InputFieldWrapper extends ig.GuiElementBase {
            inputField: modmanager.gui.InputField
            isValidText?: sc.TextGui
        }
        interface InputFieldWrapperConstructor extends ImpactClass<InputFieldWrapper> {
            new (
                initialValue: string,
                setValueFunc: (text: string) => void,
                width: number,
                isValid?: InputFieldIsValidFunc,
                description?: string
            ): InputFieldWrapper
        }
        var InputFieldWrapper: InputFieldWrapperConstructor
    }
}
modmanager.gui.InputFieldWrapper = ig.GuiElementBase.extend({
    init(initialValue, setValueFunc, width, isValidFunc, description) {
        this.parent()

        const xOffsetWhenIsValidFunc = 20 + 4
        this.inputField = new modmanager.gui.InputField(width - 30 + (isValidFunc ? 0 : xOffsetWhenIsValidFunc - 2), 20)

        this.inputField.setText?.(initialValue)

        const revalidate = async (text: string) => {
            if (!isValidFunc) throw new Error('how')

            this.isValidText!.setText('\\i[lore-others]')
            const isValid = await isValidFunc(text)

            if (this.inputField.getValueAsString() == text) {
                this.isValidText!.setText(isValid ? '\\i[quest-solve]' : '\\i[quest-elite]')
                return isValid
            } else return false
        }

        if (isValidFunc) {
            this.inputField.setPos(xOffsetWhenIsValidFunc, 0)
            this.isValidText = new sc.TextGui('')
            this.isValidText.setPos(3, 2)
            this.addChildGui(this.isValidText)
            revalidate(initialValue)
        } else {
            this.inputField.setPos(2, 0)
        }

        this.inputField.onCharacterInput = str => {
            if (isValidFunc) {
                revalidate(str).then(isValid => {
                    if (isValid) setValueFunc(str)
                })
            } else {
                setValueFunc(str)
            }
        }

        this.inputField.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_CENTER)

        if (description) {
            const backup = this.inputField.focusGained.bind(this.inputField)
            this.inputField.focusGained = function (this: modmanager.gui.InputField) {
                backup()
                sc.menu.setInfoText(description)
            }
        }
        this.setSize(width, this.inputField.hook.size.y)

        this.addChildGui(this.inputField)
    },
})

declare global {
    namespace modmanager.gui.Options {
        interface INPUT_FIELD extends modmanager.gui.InputFieldWrapper, ModOptionsOptionElement {}
        interface INPUT_FIELD_CONSTRUCTOR extends ImpactClass<INPUT_FIELD>, ModOptionsOptionConstructor<INPUT_FIELD> {}
        var INPUT_FIELD: INPUT_FIELD_CONSTRUCTOR
    }
}

modmanager.gui.Options.INPUT_FIELD = modmanager.gui.InputFieldWrapper.extend({
    init(optionRow, width, rowGroup) {
        const option = (optionRow as modmanager.gui.OptionsOptionRow).guiOption
        this.guiOption = option
        if (option.type != 'INPUT_FIELD') throw new Error('how')
        this.parent(optGet(option) as string, text => optSet(option, text), width, option.isValid, option.description)

        rowGroup.addFocusGui(this.inputField, 0, optionRow.row)
    },
    getNameGuiInfo() {
        return { has: true }
    },
})
