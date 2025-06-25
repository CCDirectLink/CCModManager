export {};
declare global {
    namespace modmanager.gui {
        interface InputFieldCursor extends ig.GuiElementBase {
            colour: string;
            cursorTick: number;
            movingTimer: number;
            active: boolean;
        }
        interface InputFieldCursorCon extends ImpactClass<InputFieldCursor> {
            new (colour: string): InputFieldCursor;
        }
        let InputFieldCursor: InputFieldCursorCon;
    }
}
