import './menu.js'

const icons = new ig.Font('media/font/CCModManagerIcons.png', 12, ig.MultiFont.ICON_START)
const newFontIndex = sc.fontsystem.font.iconSets.length
sc.fontsystem.font.pushIconSet(icons)
sc.fontsystem.font.setMapping({
    'mod-download': [newFontIndex, 0],
    'mod-config': [newFontIndex, 1],
    'mod-refresh': [newFontIndex, 2],
    'mod-delete': [newFontIndex, 3],
})

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

sc.OptionsMenu.inject({
    init() {
        this.parent()

        this.modsButton = new sc.ButtonGui('\\i[help3]' + ig.lang.get('sc.gui.menu.menu-titles.mods'), undefined, true, sc.BUTTON_TYPE.SMALL)
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
        console.log('hide')
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
