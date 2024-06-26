export {}
declare global {
    namespace modmanager.gui {
        interface ListEntryHighlight extends ig.GuiElementBase {
            gfx: ig.Image
            ninepatch: ig.NinePatch
            buttonCover: ig.NinePatch
            textWidth: number
            buttonWidth: number
            highLightOffsetY: number
            textTag: ig.ImagePattern
            textTagHighlighted: ig.ImagePattern
            focus: boolean

            updateWidth(this: this, width: number, textWidth: number): void
        }
        interface ListEntryHighlightConstructor extends ImpactClass<ListEntryHighlight> {
            new (width: number, height: number, textWidth: number, buttonWidth: number): ListEntryHighlight
        }
        var ListEntryHighlight: ListEntryHighlightConstructor
    }
}

modmanager.gui.ListEntryHighlight = ig.GuiElementBase.extend({
    gfx: new ig.Image('media/gui/CCModManager.png'),
    ninepatch: new ig.NinePatch('media/gui/CCModManager.png', {
        left: 3,
        width: 38,
        right: 0,
        top: 14,
        height: 24,
        bottom: 3,
        offsets: { default: { x: 44, y: 0 }, focus: { x: 44, y: 41 } },
    }),
    buttonCover: new ig.NinePatch('media/gui/CCModManager.png', {
        left: 4,
        width: 30,
        right: 1,
        top: 14,
        height: 9,
        bottom: 18,
        offsets: { default: { x: 51, y: 96 }, focus: { x: 7, y: 96 } },
    }),
    highLightOffsetY: 41,

    textTag: new ig.ImagePattern('media/gui/CCModManager.png', 91, 3, 18, 13, ig.ImagePattern.OPT.REPEAT_X),
    textTagHighlighted: new ig.ImagePattern('media/gui/CCModManager.png', 91, 44, 18, 13, ig.ImagePattern.OPT.REPEAT_X),
    focus: false,

    init(width, height, textWidth, buttonWidth) {
        this.parent()
        this.setSize(width, height)
        this.textWidth = textWidth
        this.buttonWidth = buttonWidth
    },
    updateWidth(width, textWidth) {
        this.setSize(width, this.hook.size.y)
        this.textWidth = textWidth
    },
    updateDrawables(renderer) {
        this.ninepatch.draw(
            renderer,
            this.hook.size.x - this.buttonWidth - 6,
            this.hook.size.y + 1,
            this.focus ? 'focus' : 'default'
        )

        this.buttonCover.draw(
            renderer,
            this.buttonWidth + 4,
            this.hook.size.y + 1,
            this.focus ? 'focus' : 'default',
            this.hook.size.x - this.buttonWidth - 30
        )

        renderer.addPattern(this.focus ? this.textTagHighlighted : this.textTag, 3, 3, 90, 0, this.textWidth, 13)

        renderer.addGfx(this.gfx, this.textWidth + 3, 3, 109, this.focus ? 44 : 3, 6, 13)
    },
})
