import { Lang } from '../lang-manager'

export {}
declare global {
    namespace sc {
        interface TitleScreenButtonGui {
            modsButton: sc.ButtonGui
        }
    }
}

sc.TitleScreenButtonGui.inject({
    init() {
        this.parent()

        // Get the first button in the second column so we can position our button above it.
        const lastButton = this.buttonGroup.elements[1].find(Boolean)!.hook

        const text = Lang.titleScreenButton
        const onClick = () => {
            sc.menu.setDirectMode(true, sc.MENU_SUBMENU.MODS)
            sc.model.enterMenu(true)
        }

        const button = new sc.ButtonGui(text, lastButton.size.x)
        button.setAlign(lastButton.align.x, lastButton.align.y)
        button.setPos(lastButton.pos.x, lastButton.pos.y + 28)

        button.hook.transitions = lastButton.transitions
        button.doStateTransition('HIDDEN', true)

        this.buttonGroup.insertFocusGui(button, 1, 0)
        this.insertChildGui(button, 0)

        button.onButtonPress = onClick

        this.modsButton = button
    },
    show() {
        this.parent()
        this.modsButton.doStateTransition('DEFAULT')
    },
    hide(skipTransition) {
        this.parent(skipTransition)
        this.modsButton.doStateTransition('HIDDEN')
    },
})
