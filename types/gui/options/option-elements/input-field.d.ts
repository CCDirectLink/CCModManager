import { InputFieldIsValidFunc } from '../../../mod-options';
import { ModOptionsOptionConstructor, ModOptionsOptionElement } from './all';
declare global {
    namespace modmanager.gui {
        interface InputFieldWrapper extends ig.GuiElementBase {
            inputField: modmanager.gui.InputField;
            isValidText?: sc.TextGui;
        }
        interface InputFieldWrapperConstructor extends ImpactClass<InputFieldWrapper> {
            new (initialValue: string, setValueFunc: (text: string) => void, width: number, isValid?: InputFieldIsValidFunc, description?: string): InputFieldWrapper;
        }
        var InputFieldWrapper: InputFieldWrapperConstructor;
    }
}
declare global {
    namespace modmanager.gui.Options {
        interface INPUT_FIELD extends modmanager.gui.InputFieldWrapper, ModOptionsOptionElement {
        }
        interface INPUT_FIELD_CONSTRUCTOR extends ImpactClass<INPUT_FIELD>, ModOptionsOptionConstructor<INPUT_FIELD> {
        }
        var INPUT_FIELD: INPUT_FIELD_CONSTRUCTOR;
    }
}
