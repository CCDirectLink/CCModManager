import { Lang } from '../lang-manager'
import { Opts } from '../options'

export {}
declare global {
    namespace sc {
        interface TitleScreenButtonGui {
            modsButton: sc.ButtonGui

            showModsButton(this: this): void
        }
    }
}

function fixTitleScreenButtonOrdering(this: sc.TitleScreenButtonGui) {
    if (ig.platform == ig.PLATFORM_TYPES.DESKTOP) {
        const exitButton = this.buttons[0]
        if (this.buttonGroup?.elements?.[0]?.[5] == exitButton) {
            const enterBonusCodeButton = this.buttonGroup.removeFocusGui(1, 4)
            if (enterBonusCodeButton) {
                this.buttonGroup.addFocusGui(enterBonusCodeButton, 1, 5)
            }
            const twitterButton = this.buttonGroup.removeFocusGui(2, 4)
            if (twitterButton) {
                this.buttonGroup.addFocusGui(twitterButton, 2, 5)
            }
        }
    }
}

sc.TitleScreenButtonGui.inject({
    init() {
        this.parent()

        fixTitleScreenButtonOrdering.call(this)

        // Get the first button in the second column so we can position our button above it.
        const lastButtonIndex = this.buttonGroup.elements[1].findIndex(Boolean)
        const lastButton = this.buttonGroup.elements[1][lastButtonIndex]?.hook
        if (!lastButton) return // should never happen, but just in case

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

        this.buttonGroup.addFocusGui(button, 1, lastButtonIndex - 1)
        this.insertChildGui(button, 0)

        button.onButtonPress = onClick

        this.modsButton = button
    },
    show() {
        this.parent()
        this.showModsButton()
    },
    showModsButton() {
        if (Opts.showTitleScreenButton) {
            this.modsButton.doStateTransition('DEFAULT')
        } else {
            this.modsButton.doStateTransition('HIDDEN', true)
        }
    },
    hide(skipTransition) {
        this.parent(skipTransition)
        this.modsButton.doStateTransition('HIDDEN', skipTransition)
    },
})

sc.TitleScreenGui.inject({
    modelChanged(model, message, data) {
        this.parent(model, message, data)
        if (model == sc.menu && message == sc.MENU_EVENT.EXIT_MENU) {
            this.buttons.showModsButton()
        }
    },
})
