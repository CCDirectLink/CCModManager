import './input-field-cursor';
import './input-field-type';
declare global {
    namespace modmanager.gui {
        interface InputField extends ig.FocusGui {
            gfx: ig.Image;
            value: string[];
            bg: sc.ButtonBgGui;
            focusTimer: number;
            alphaTimer: number;
            animateOnPress: boolean;
            noFocusOnPressed: boolean;
            submitSound: ig.Sound;
            blockedSound: ig.Sound;
            type: modmanager.gui.InputFieldType;
            boundProcessInput: (this: Window, ev: KeyboardEvent) => any;
            validChars: RegExp;
            onCharacterInput: (value: string, key: string) => any;
            dummyForClipping: sc.DummyContainer;
            highlight: sc.ButtonHighlightGui;
            textChild: sc.TextGui;
            cursorTick: number;
            cursorPos: number;
            cursor: InputFieldCursor;
            obscure: boolean;
            obscureChar: string;
            calculateCursorPos(this: this): number;
            getValueAsString(this: this): string;
            processInput(this: this, event: KeyboardEvent): void;
            setTextChildText(this: this, text: string): void;
            setText(this: this, text: string): void;
            unsetFocus(this: this): void;
            updateCursorPos(this: this, delta: number): void;
            setObscure(this: this, obscure: boolean): void;
        }
        interface InputFieldCon extends ImpactClass<InputField> {
            new (width: number, height: number, type?: modmanager.gui.InputFieldType, obscure?: boolean, obscureChar?: string): InputField;
        }
        let InputField: InputFieldCon;
    }
}
