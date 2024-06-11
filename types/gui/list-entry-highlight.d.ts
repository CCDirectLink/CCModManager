export {};
declare global {
    namespace modmanager.gui {
        interface ListEntryHighlight extends ig.GuiElementBase {
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
        interface ListEntryHighlightConstructor extends ImpactClass<ListEntryHighlight> {
            new (width: number, height: number, textWidth: number, buttonWidth: number): ListEntryHighlight;
        }
        var ListEntryHighlight: ListEntryHighlightConstructor;
    }
}
