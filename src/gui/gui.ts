import { Lang } from '../lang-manager.js'
import { registerDynamicIcons, registerModManagerIcons } from './icons.js'
import './menu.js'

declare global {
    namespace sc {
        interface OptionsMenu {
            modsButton: sc.ButtonGui
        }
    }
}

registerModManagerIcons()
registerDynamicIcons()

sc.OptionsMenu.inject({
    init() {
        this.parent()

        this.modsButton = new sc.ButtonGui('\\i[help3]' + Lang.mods, undefined, true, sc.BUTTON_TYPE.SMALL)
        this.modsButton.keepMouseFocus = true
        this.modsButton.hook.transitions = {
            DEFAULT: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.EASE },
            HIDDEN: { state: { offsetY: -this.modsButton.hook.size.y }, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
        }
        this.modsButton.onButtonPress = () => {
            sc.menu.pushMenu(sc.MENU_SUBMENU.MODS)
        }
    },
    showMenu() {
        this.parent()
        if (sc.menu.backCallbackStack.length >= 2) {
            /* the options menu doesnt expect to get shown again,
             * so it always adds a pop callback, and it needs to be removed */
            sc.menu.popBackCallback()
        }
    },
    hideMenu() {
        this.parent()
        sc.menu.buttonInteract.removeGlobalButton(this.modsButton)
        sc.menu.buttonInteract.removeGlobalButton(this.hotkeyHelp)
        sc.menu.buttonInteract.removeGlobalButton(this.hotkeyDefault)
    },
    commitHotKeysToTopBar() {
        sc.menu.addHotkey(() => this.modsButton)
        this.parent()
    },
    onAddHotkeys() {
        sc.menu.buttonInteract.addGlobalButton(this.modsButton, () => sc.control.menuHotkeyHelp3())
        this.parent()
    },
})
