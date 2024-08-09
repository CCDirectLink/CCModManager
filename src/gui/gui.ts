import { Lang } from '../lang-manager.js'
import './menu.js'

const iconsFont = new ig.Font('media/font/ccmodmanager-icons.png', 16, 16)
const page = sc.fontsystem.font.iconSets.length
sc.fontsystem.font.pushIconSet(iconsFont)
const icons = [
    'ccmodmanager-git',
    'mod-icon',
    'mod-icon-online',
    'mod-icon-selected',
    'mod-icon-enabled',
    'mod-icon-disabled',
    'ccmodmanager-testing-off',
    'ccmodmanager-testing-on',
] as const
const mapping: Record<string, [number, number]> = {}
for (let i = 0; i < icons.length; i++) {
    mapping[icons[i]] = [page, i]
}
sc.fontsystem.font.setMapping(mapping)

function enterModsMenu(direct: boolean) {
    if (direct) {
        sc.menu.setDirectMode(true, sc.MENU_SUBMENU.MODS)
        sc.model.enterMenu(true)
    } else {
        sc.menu.pushMenu(sc.MENU_SUBMENU.MODS)
    }
}

declare global {
    namespace sc {
        interface OptionsMenu {
            modsButton: sc.ButtonGui
        }
    }
}

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
            enterModsMenu(false)
        }
    },
    showMenu() {
        this.parent()
        if (sc.menu.backCallbackStack.length >= 2) {
            sc.menu.popBackCallback()
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
