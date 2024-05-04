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

// @ts-expect-error
sc.MENU_SUBMENU.MODS = Math.max(...Object.values(sc.MENU_SUBMENU)) + 1

sc.SUB_MENU_INFO[sc.MENU_SUBMENU.MODS] = {
    Clazz: sc.ModMenu,
    name: 'mods',
}

function enterModsMenu(direct: boolean) {
    if (direct) {
        sc.menu.setDirectMode(true, sc.MENU_SUBMENU.MODS)
        sc.model.enterMenu(true)
    } else {
        sc.menu.pushMenu(sc.MENU_SUBMENU.MODS)
    }
}
const isEnabled = !ig.isdemo

sc.OptionsMenu.inject({
    init() {
        this.parent()

        if (!isEnabled) return
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
        if (!isEnabled) return
        if (sc.menu.backCallbackStack.length >= 2) {
            sc.menu.popBackCallback()
            sc.menu.popBackCallback()
        }
    },
    hideMenu() {
        this.parent()
        if (!isEnabled) return
        sc.menu.buttonInteract.removeGlobalButton(this.modsButton)
        sc.menu.buttonInteract.removeGlobalButton(this.hotkeyHelp)
        sc.menu.buttonInteract.removeGlobalButton(this.hotkeyDefault)
    },
    commitHotKeysToTopBar() {
        if (isEnabled) sc.menu.addHotkey(() => this.modsButton)
        this.parent()
    },
    onAddHotkeys() {
        if (isEnabled) sc.menu.buttonInteract.addGlobalButton(this.modsButton, () => sc.control.menuHotkeyHelp3())
        this.parent()
    },
})

if (!window.nax?.ccuilib?.InputField) {
    // @ts-expect-error
    window.nax ??= {}
    // @ts-expect-error
    window.nax.ccuilib ??= {}
    // @ts-expect-error
    import('nax-ccuilib/src/ui/input-field-cursor.js')
    // @ts-expect-error
    import('nax-ccuilib/src/ui/input-field.js')
}
