export {};
declare global {
    namespace modmanager.gui {
        interface ModListEntryHighlight extends ig.GuiElementBase {
            gfx: ig.Image;
            ninepatch: ig.NinePatch;
            buttonCover: ig.NinePatch;
            textWidth: number;
            buttonWidth: number;
            highLightOffsetY: number;
            textTag: ig.ImagePattern;
            textTagHighlighted: ig.ImagePattern;
            focus: boolean;
            updateWidth(this: this, width: number, textWidth: number): void;
        }
        interface ModListEntryHighlightConstructor extends ImpactClass<ModListEntryHighlight> {
            new (width: number, height: number, textWidth: number, buttonWidth: number): ModListEntryHighlight;
        }
        var ModListEntryHighlight: ModListEntryHighlightConstructor;
    }
}
