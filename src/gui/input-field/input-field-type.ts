export {}
declare global {
    namespace modmanager.gui {
        interface InputFieldType {
            height: number
            ninepatch: ig.NinePatch
            highlight: sc.ButtonGui.Highlight
        }

        let INPUT_FIELD_TYPE: { [index: string]: InputFieldType }
    }
}
modmanager.gui.INPUT_FIELD_TYPE = {}
modmanager.gui.INPUT_FIELD_TYPE.DEFAULT = {
    height: 20,
    ninepatch: new ig.NinePatch('media/gui/buttons.png', {
        width: 13,
        height: 18,
        left: 1,
        top: 1,
        right: 2,
        bottom: 2,
        offsets: {
            default: {
                x: 184,
                y: 24,
            },
            focus: {
                x: 184,
                y: 24,
            },
            pressed: {
                x: 184,
                y: 24,
            },
        },
    }),
    highlight: {
        startX: 200,
        endX: 215,
        leftWidth: 2,
        rightWidth: 2,
        offsetY: 24,
        gfx: new ig.Image('media/gui/buttons.png'),
        pattern: new ig.ImagePattern('media/gui/buttons.png', 202, 24, 11, 20, ig.ImagePattern.OPT.REPEAT_X),
    },
}
