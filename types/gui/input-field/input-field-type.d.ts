export {};
declare global {
    namespace modmanager.gui {
        interface InputFieldType {
            height: number;
            ninepatch: ig.NinePatch;
            highlight: sc.ButtonGui.Highlight;
        }
        let INPUT_FIELD_TYPE: {
            [index: string]: InputFieldType;
        };
    }
}
