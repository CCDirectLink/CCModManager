import { ModEntry } from '../../types'

declare global {
    namespace sc {
        interface ModSettingsMenu extends sc.BaseMenu {
            mod: ModEntry

            helpGui: sc.HelpScreen
            hotkeyHelp: sc.ButtonGui
            hotkeyDefault: sc.ButtonGui
            listBox: sc.ModSettingsTabBox

            initHotkeyHelp(this: this): void
            initHotkeyDefault(this: this): void
            initListBox(this: this): void
            createHelpGui(this: this): void
            commitHotKeysToTopBar(this: this, longTransition?: boolean): void

            updateEntries(this: this, mod: ModEntry): void
            resetOptionsToDefault(this: this): void
        }
        interface ModSettingsMenuConstructor extends ImpactClass<ModSettingsMenu> {
            new (): ModSettingsMenu
        }
        var ModOptionsMenu: ModSettingsMenuConstructor
        var modSettingsMenu: ModSettingsMenu

        enum MENU_SUBMENU {
            MOD_OPTIONS = 375943,
        }
    }
}

function getMainMenu(): sc.MainMenu {
    return ig.gui.guiHooks.find(h => h.gui instanceof sc.MainMenu)!.gui as sc.MainMenu
}

let menuPurgeTimeoutId: NodeJS.Timeout
sc.ModOptionsMenu = sc.BaseMenu.extend({
    init() {
        this.parent()

        this.hook.size.x = ig.system.width
        this.hook.size.y = ig.system.height

        this.initHotkeyHelp()
        this.initHotkeyDefault()
        this.initListBox()

        this.doStateTransition('DEFAULT', true)

        sc.modSettingsMenu = this
    },
    initHotkeyHelp() {
        this.hotkeyHelp = new sc.ButtonGui('\\i[help]' + ig.lang.get('sc.gui.menu.hotkeys.help'), undefined, true, sc.BUTTON_TYPE.SMALL)
        this.hotkeyHelp.keepMouseFocus = true
        this.hotkeyHelp.hook.transitions = {
            DEFAULT: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.EASE },
            HIDDEN: { state: { offsetY: -this.hotkeyHelp.hook.size.y }, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
        }
        this.hotkeyHelp.onButtonPress = () => {
            if (!this.listBox.conf.settings.helpMenu) return
            sc.BUTTON_SOUND.submit.play()
            sc.menu.removeHotkeys()
            this.createHelpGui()
            ig.gui.addGuiElement(this.helpGui)
            this.helpGui.openMenu()
        }
        this.hotkeyHelp.submitSound = undefined
        this.hotkeyHelp.doStateTransition('HIDDEN')
    },
    initHotkeyDefault() {
        this.hotkeyDefault = new sc.ButtonGui('\\i[help2]' + ig.lang.get('sc.gui.menu.hotkeys.reset-default'), undefined, true, sc.BUTTON_TYPE.SMALL)
        this.hotkeyDefault.keepMouseFocus = true
        this.hotkeyDefault.hook.transitions = {
            DEFAULT: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.EASE },
            HIDDEN: { state: { offsetY: -this.hotkeyDefault.hook.size.y }, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
        }
        this.hotkeyDefault.onButtonPress = () => {
            sc.Dialogs.showYesNoDialog(ig.lang.get('sc.gui.dialogs.resetAsk'), sc.DIALOG_INFO_ICON.WARNING, button => {
                if (button.data == 0) {
                    this.resetOptionsToDefault()
                }
            })
        }
    },
    initListBox() {
        this.listBox = new sc.ModSettingsTabBox()
        this.addChildGui(this.listBox)
    },
    addObservers() {
        this.listBox.addObservers()
    },
    removeObservers() {
        this.listBox.removeObservers()
    },
    showMenu(previousMenu, prevSubmenu) {
        clearTimeout(menuPurgeTimeoutId)
        this.parent(previousMenu, prevSubmenu)

        this.addObservers()

        sc.menu.moveLeaSprite(0, 0, sc.MENU_LEA_STATE.HIDDEN)

        sc.menu.buttonInteract.addGlobalButton(this.hotkeyHelp, () => sc.control.menuHotkeyHelp())
        sc.menu.buttonInteract.addGlobalButton(this.hotkeyDefault, () => sc.control.menuHotkeyHelp2())

        this.listBox.showMenu()
    },
    hideMenu(afterMenu, nextSubmenu) {
        this.parent(afterMenu, nextSubmenu)

        this.removeObservers()
        sc.menu.moveLeaSprite(0, 0, sc.MENU_LEA_STATE.LARGE)

        sc.menu.buttonInteract.removeGlobalButton(this.hotkeyHelp)
        sc.menu.buttonInteract.removeGlobalButton(this.hotkeyDefault)

        sc.menu.popBackCallback()

        this.listBox.hideMenu()

        /* purging the menu immediately would disable the smooth fade out transition */
        menuPurgeTimeoutId = setTimeout(() => {
            const mainMenu = getMainMenu()
            mainMenu.removeChildGui(this)
            delete mainMenu.submenus[modOptionsMenuId]
        }, 1000)
    },
    commitHotKeysToTopBar(longTransition) {
        if (this.listBox.conf.settings.helpMenu) sc.menu.addHotkey(() => this.hotkeyHelp)
        sc.menu.addHotkey(() => this.hotkeyDefault)
        sc.menu.commitHotkeys(longTransition)
    },
    createHelpGui() {
        if (!this.helpGui && this.listBox.conf.settings.helpMenu) {
            this.helpGui = new sc.HelpScreen(
                this,
                this.listBox.conf.settings.helpMenu.title,
                this.listBox.conf.settings.helpMenu.pages,
                () => this.commitHotKeysToTopBar(true),
                true
            )
            this.helpGui.hook.zIndex = 15e4
            this.helpGui.hook.pauseGui = true
        }
    },
    updateEntries(mod: ModEntry) {
        this.mod = mod
        this.listBox.updateEntries(mod)
        this.commitHotKeysToTopBar()
        if (this.listBox.conf.settings.helpMenu) {
            this.hotkeyHelp.doStateTransition('DEFAULT')
        }

        const smb = getMainMenu()
            .menuDisplay.hook.children.filter(h => h.gui instanceof sc.MainMenu.SubMenuBox)
            .last().gui as sc.MainMenu.SubMenuBox
        smb.text.setText(this.mod.name)
    },
    resetOptionsToDefault() {
        // TODO: this
    },
})

// @ts-expect-error uhhhhhh enum moment
sc.MENU_SUBMENU.MOD_OPTIONS = 375943
const modOptionsMenuId = 'mod_settings_menu'
sc.SUB_MENU_INFO[sc.MENU_SUBMENU.MOD_OPTIONS] = {
    Clazz: sc.ModOptionsMenu,
    name: modOptionsMenuId,
}

import './tabbox'
import './option-row'
import './tabbutton'
import './option-elements-inject'
