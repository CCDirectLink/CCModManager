import { ModEntry } from '../../types'
import { GuiOption, ModOptionsSettings } from '../../mod-options'

declare global {
    namespace modmanager.gui {
        interface OptionsMenu extends sc.BaseMenu, sc.Model.Observer {
            mod: ModEntry

            helpGui: sc.HelpScreen
            hotkeyHelp: sc.ButtonGui
            hotkeyDefault: sc.ButtonGui
            listBox: modmanager.gui.OptionsTabBox

            initHotkeyHelp(this: this): void
            initHotkeyDefault(this: this): void
            initListBox(this: this): void
            createHelpGui(this: this): void
            commitHotKeysToTopBar(this: this, longTransition?: boolean): void

            getHelpMenuLangData(this: this): ModOptionsSettings['helpMenu']
            updateHelpButtonVisibility(this: this): void

            updateEntries(this: this, mod: ModEntry): void
            resetOptionsToDefault(this: this): void

            reopenMenu(this: this): void
        }
        interface OptionsMenuConstructor extends ImpactClass<OptionsMenu> {
            new (): OptionsMenu
        }
        var OptionsMenu: OptionsMenuConstructor
        var optionsMenu: OptionsMenu
    }
    namespace sc {
        enum MENU_SUBMENU {
            MOD_OPTIONS = 375943,
        }
    }
}

let menuPurgeTimeoutId: NodeJS.Timeout
modmanager.gui.OptionsMenu = sc.BaseMenu.extend({
    init() {
        this.parent()

        this.hook.size.x = ig.system.width
        this.hook.size.y = ig.system.height

        this.initHotkeyHelp()
        this.initHotkeyDefault()
        this.initListBox()

        this.doStateTransition('DEFAULT', true)

        modmanager.gui.optionsMenu = this
    },
    initHotkeyHelp() {
        this.hotkeyHelp = new sc.ButtonGui(
            '\\i[help]' + ig.lang.get('sc.gui.menu.hotkeys.help'),
            undefined,
            true,
            sc.BUTTON_TYPE.SMALL
        )
        this.hotkeyHelp.keepMouseFocus = true
        this.hotkeyHelp.hook.transitions = {
            DEFAULT: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.EASE },
            HIDDEN: { state: { offsetY: -this.hotkeyHelp.hook.size.y }, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
        }
        this.hotkeyHelp.onButtonPress = () => {
            if (!this.getHelpMenuLangData()) return
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
        this.hotkeyDefault = new sc.ButtonGui(
            '\\i[help2]' + ig.lang.get('sc.gui.menu.hotkeys.reset-default'),
            undefined,
            true,
            sc.BUTTON_TYPE.SMALL
        )
        this.hotkeyDefault.keepMouseFocus = true
        this.hotkeyDefault.hook.transitions = {
            DEFAULT: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.EASE },
            HIDDEN: {
                state: { offsetY: -this.hotkeyDefault.hook.size.y },
                time: 0.2,
                timeFunction: KEY_SPLINES.LINEAR,
            },
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
        this.listBox = new modmanager.gui.OptionsTabBox()
        this.addChildGui(this.listBox)
    },
    addObservers() {
        sc.Model.addObserver(sc.menu, this)
        this.listBox.addObservers()
    },
    removeObservers() {
        sc.Model.removeObserver(sc.menu, this)
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
            const mainMenu = sc.menu.guiReference
            mainMenu.removeChildGui(this)
            delete mainMenu.submenus[modOptionsMenuId]
        }, 1000)
    },
    commitHotKeysToTopBar(longTransition) {
        if (this.getHelpMenuLangData()) sc.menu.addHotkey(() => this.hotkeyHelp)
        sc.menu.addHotkey(() => this.hotkeyDefault)
        sc.menu.commitHotkeys(longTransition)
    },

    getHelpMenuLangData() {
        const currenTabSettings = Object.values(this.listBox.conf.structure)[this.listBox.currentTab].settings.helpMenu
        return currenTabSettings ?? this.listBox.conf.settings.helpMenu
    },
    createHelpGui() {
        const langData = this.getHelpMenuLangData()
        if (langData) {
            this.helpGui = new sc.HelpScreen(
                this,
                langData.title,
                langData.pages,
                () => this.commitHotKeysToTopBar(true),
                true
            )
            this.helpGui.hook.zIndex = 15e4
            this.helpGui.hook.pauseGui = true
        }
    },
    modelChanged(model, message, _data) {
        if (model == sc.menu && message == sc.MENU_EVENT.OPTION_CHANGED_TAB) {
            this.updateHelpButtonVisibility()
        }
    },
    updateHelpButtonVisibility() {
        const hasHelp = !!this.getHelpMenuLangData()
        const newState = hasHelp ? 'DEFAULT' : 'HIDDEN'

        if (this.hotkeyHelp.hook.currentStateName != newState) {
            this.hotkeyHelp.doStateTransition(newState)
            sc.menu.removeHotkeys()
            this.commitHotKeysToTopBar()
        }
    },

    updateEntries(mod: ModEntry) {
        this.mod = mod
        this.listBox.updateEntries(mod)
        this.commitHotKeysToTopBar()

        this.updateHelpButtonVisibility()

        const smb = sc.menu.guiReference
            .menuDisplay.hook.children.filter(h => h.gui instanceof sc.MainMenu.SubMenuBox)
            .last().gui as sc.MainMenu.SubMenuBox
        smb.text.setText(this.mod.name)
    },
    resetOptionsToDefault() {
        const options = modmanager.options[this.mod.id]
        const optionsToReset = Object.getOwnPropertyNames(options).filter(e => e != 'flatOpts')
        for (const optName of optionsToReset) {
            const optConfig: GuiOption = options.flatOpts[optName]
            if (!('init' in optConfig)) throw new Error('what')
            options[optName] = optConfig.init
        }
        this.reopenMenu()
    },
    reopenMenu() {
        /* re-open the menu to update the option guis with the new values */
        this.hide()
        sc.menu.popBackCallback()
        sc.menu.popMenu()
        const mainMenu = sc.menu.guiReference
        mainMenu.removeChildGui(this)
        delete mainMenu.submenus[modOptionsMenuId]
        sc.menu.pushMenu(sc.MENU_SUBMENU.MOD_OPTIONS)
        /* skip transitions */
        mainMenu.menuDisplay.boxes.last().doStateTransition('DEFAULT', true)
        modmanager.gui.optionsMenu.doStateTransition('DEFAULT', true)
        modmanager.gui.optionsMenu.listBox.doStateTransition('DEFAULT', true)

        modmanager.gui.optionsMenu.updateEntries(this.mod)
        modmanager.gui.optionsMenu.listBox.setCurrentTab(this.listBox.currentTab)

        /* skip transitions even more */
        mainMenu.hotkeyBar._hotkeyTimer = 10e10
        mainMenu.hotkeyBar.doStateTransition('DEFAULT', true)
        for (const button of mainMenu.hotkeyBar.hook.children) button.doStateTransition('DEFAULT', true)

        ig.interact.setBlockDelay(0)

        /* refocus the last element, we need to find it first cuz it might have moved to a diffrent position */
        const element = this.listBox.rowButtonGroup.getCurrentElement() as sc.ButtonGui | undefined
        if (!element) return

        let y!: number
        const x = modmanager.gui.optionsMenu.listBox.rowButtonGroup.elements.findIndex(arr => {
            y = arr.findIndex(e => {
                if (typeof element.data !== typeof e.data) return false
                if (typeof e.data === 'object' && typeof element.data === 'object') {
                    return (
                        'description' in e.data! &&
                        'description' in element.data! &&
                        e.data.description == element.data.description
                    )
                } else {
                    return e.data == element.data
                }
            })
            return y != -1
        })
        modmanager.gui.optionsMenu.listBox.rowButtonGroup.focusCurrentButton(y, x, false, true, false)
    },
})

// @ts-expect-error uhhhhhh enum moment
sc.MENU_SUBMENU.MOD_OPTIONS = 375943
const modOptionsMenuId = 'mod_settings_menu'
sc.SUB_MENU_INFO[sc.MENU_SUBMENU.MOD_OPTIONS] = {
    Clazz: modmanager.gui.OptionsMenu,
    name: modOptionsMenuId,
}

import './tabbox'
import './option-row'
import './tabbutton'
import './option-elements-inject'
