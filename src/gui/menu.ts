import { ModDB } from '../moddb'
import { InstallQueue, ModInstaller } from '../mod-installer'
import { ModEntry, ModEntryServer } from '../types'
import { ModInstallDialogs } from './install-dialogs'
import { LocalMods } from '../local-mods'
import { Lang } from '../lang-manager'
import './list'
import './filters'
import './multipage-button-box'
import './changelog'
import './options/mod-options-menu'
import './manual-enforcer'
import './input-field/input-field'

import type {} from 'crossedeyes/src/tts/gather/checkbox-types.d'
import { isFullMode, openLink } from '../plugin'

declare global {
    namespace modmanager.gui {
        enum MENU_SORT_ORDER {
            NAME,
            STARS,
            LAST_UPDATED,
        }
        enum MENU_MESSAGES {
            SELECTED_ENTRIES_CHANGED,
            TAB_CHANGED,
            UPDATE_ENTRIES,
            ENTRY_FOCUSED,
            ENTRY_UNFOCUSED,
            ENTRY_UPDATE_COLOR,
        }
        interface Menu extends sc.ListInfoMenu, sc.Model {
            list: MenuList
            inputField: modmanager.gui.InputField
            installButton: sc.ButtonGui
            uninstallButton: sc.ButtonGui
            testingToggleButton: sc.ButtonGui
            openRepositoryUrlButton: sc.ButtonGui
            modOptionsButton: sc.ButtonGui
            checkUpdatesButton: sc.ButtonGui
            filtersButton: sc.ButtonGui
            filtersPopup: modmanager.gui.FiltersPopup
            changelogButton: sc.ButtonGui
            changelogPopup?: modmanager.gui.Changelog

            initInputField(this: this): void
            initSortMenu(this: this): void
            initInstallButton(this: this, bottomY: number): void
            initUninstallButton(this: this, bottomY: number): void
            initCheckUpdatesButton(this: this, bottomY: number): void
            initFiltersButton(this: this, bottomY: number): void
            initTestingToggleButton(this: this): void
            initOpenRepositoryUrlButton(this: this): void
            initModOptionsButton(this: this, bottomY: number): void
            initChangelogButton(this: this): void

            isInMenuStack(this: this): boolean
            setBlackBarVisibility(this: this, visible: boolean): void
            setAllVisibility(this: this, visible: boolean): void
            updateInstallButtonText(this: this): void
            setTabEvent(this: this): void
            showModInstallDialog(this: this): void
            getCurrentlyFocusedModEntry(this: this): modmanager.gui.ListEntry | undefined
            openModSettings(this: this, mod: ModEntry): void
            openRepositoriesPopup(this: this): void
            openChangelogPopup(this: this, mod: ModEntryServer): void
        }
        interface MenuConstructor extends ImpactClass<Menu> {
            new (): Menu
        }
        var Menu: MenuConstructor
        var menu: Menu
    }
    namespace sc {
        enum MENU_SUBMENU {
            MODS,
        }
    }
}
modmanager.gui.MENU_SORT_ORDER = {
    NAME: 0,
    STARS: 1,
    LAST_UPDATED: 2,
} as const

modmanager.gui.MENU_MESSAGES = {
    SELECTED_ENTRIES_CHANGED: 0,
    TAB_CHANGED: 1,
    UPDATE_ENTRIES: 2,
    ENTRY_FOCUSED: 3,
    ENTRY_UNFOCUSED: 4,
    ENTRY_UPDATE_COLOR: 5,
} as const

sc.GlobalInput.inject({
    onPostUpdate() {
        if (sc.menu.currentMenu == sc.MENU_SUBMENU.MODS && sc.control.menu()) return
        this.parent()
    },
})

sc.Control.inject({
    menuConfirm() {
        if (!modmanager.gui.menu?.isInMenuStack()) return this.parent()

        /* remove ig.input.pressed('special') to prevent weird list jumping on space bar press */
        return this.autoControl
            ? ig.input.currentDevice == ig.INPUT_DEVICES.GAMEPAD && this.autoControl.get('menuConfirm')
            : (ig.input.pressed('confirm') ||
                  /* ig.input.pressed('special') || */ ig.gamepad.isButtonPressed(ig.BUTTONS.FACE0)) &&
                  !ig.interact.isBlocked()
    },
    menuBack() {
        if (!modmanager.gui.menu?.isInMenuStack()) return this.parent()

        /* Prevent backspace from closing the menu, it happens accidentally when you try to search something */
        /* Prevent right clign from closing the menu, since we use it for clicking on mods */
        // prettier-ignore
        return this.autoControl
            ? this.autoControl.get('menuBack')
            : ig.input.pressed('pause') ||
              ig.input.pressed('back') ||
              (sc.menu.currentMenu == sc.MENU_SUBMENU.MODS ? false : ig.input.pressed('dash'))
              || ig.gamepad.isButtonPressed(ig.BUTTONS.FACE1)
    },
})

modmanager.gui.Menu = sc.ListInfoMenu.extend({
    observers: [],
    init() {
        modmanager.gui.menu = this
        ModDB.loadDatabases()
        this.parent(new modmanager.gui.MenuList())
        this.list.setPos(9, 23)

        this.initSortMenu()
        const bottomY = 285
        this.initInstallButton(bottomY)
        this.initInputField()
        this.initUninstallButton(bottomY)
        this.initCheckUpdatesButton(bottomY)
        this.initFiltersButton(bottomY)
        this.initTestingToggleButton()
        this.initOpenRepositoryUrlButton()
        this.initModOptionsButton(bottomY)
        this.initChangelogButton()

        this.setTabEvent()
    },

    initInputField() {
        this.inputField = new modmanager.gui.InputField(232, 20)
        this.inputField.setPos(124, 2)
        this.inputField.onCharacterInput = str => {
            this.list.filters.name = str
            this.list.reloadFilters()
        }
        this.addChildGui(this.inputField)

        this.inputField.hook.transitions['HIDDEN'] = this.installButton.hook.transitions['HIDDEN']
    },
    initSortMenu() {
        this.sortMenu.addButton('name', modmanager.gui.MENU_SORT_ORDER.NAME, modmanager.gui.MENU_SORT_ORDER.NAME)
        this.sortMenu.addButton('stars', modmanager.gui.MENU_SORT_ORDER.STARS, modmanager.gui.MENU_SORT_ORDER.STARS)
        this.sortMenu.addButton(
            'lastUpdated',
            modmanager.gui.MENU_SORT_ORDER.LAST_UPDATED,
            modmanager.gui.MENU_SORT_ORDER.LAST_UPDATED
        )
    },
    initInstallButton(bottomY) {
        this.installButton = new sc.ButtonGui('', 128, true, sc.BUTTON_TYPE.SMALL)
        this.updateInstallButtonText()
        this.installButton.setPos(146, bottomY)
        this.installButton.onButtonPress = () => {
            if (this.list.currentTabIndex == modmanager.gui.MOD_MENU_TAB_INDEXES.SELECTED) sc.BUTTON_SOUND.submit.play()
            ModInstaller.findDepsDatabase(InstallQueue.values(), ModDB.modRecord)
                .then(mods => {
                    InstallQueue.add(...mods)
                    this.showModInstallDialog()
                })
                .catch(err => sc.Dialogs.showErrorDialog(err))
        }
        this.installButton.submitSound = undefined
        if (isFullMode()) this.addChildGui(this.installButton)
    },
    initUninstallButton(bottomY) {
        this.uninstallButton = new sc.ButtonGui('\\i[help2]' + Lang.uninstall, 85, true, sc.BUTTON_TYPE.SMALL)
        this.uninstallButton.setPos(390, bottomY)
        this.uninstallButton.onButtonPress = () => {
            const mod: ModEntry = this.getCurrentlyFocusedModEntry()!.mod
            const localMod = mod.isLocal ? mod : mod.localCounterpart
            if (localMod /* this should ALWAYS be true but anyways */) {
                if (ModInstallDialogs.showModUninstallDialog(localMod)) {
                    sc.BUTTON_SOUND.submit.play()
                } else {
                    sc.BUTTON_SOUND.denied.play()
                }
            }
        }
        this.uninstallButton.submitSound = undefined
        this.uninstallButton.keepMouseFocus = true /* prevent the focus jumping all over the place on press */

        if (isFullMode()) this.addChildGui(this.uninstallButton)
    },
    initCheckUpdatesButton(bottomY) {
        this.checkUpdatesButton = new sc.ButtonGui(Lang.checkUpdates, 108, true, sc.BUTTON_TYPE.SMALL)
        this.checkUpdatesButton.setPos(278, bottomY)
        this.checkUpdatesButton.onButtonPress = () => {
            if (this.list.currentTabIndex == modmanager.gui.MOD_MENU_TAB_INDEXES.SELECTED) sc.BUTTON_SOUND.submit.play()
            ModInstaller.appendToUpdateModsToQueue().then(hasUpdated => {
                if (hasUpdated) {
                    sc.Model.notifyObserver(modmanager.gui.menu, modmanager.gui.MENU_MESSAGES.UPDATE_ENTRIES)
                    this.list.tabGroup._invokePressCallbacks(this.list.tabs[Lang.selectedModsTab], true)
                    sc.Dialogs.showInfoDialog(Lang.updatesFound)
                } else {
                    sc.Dialogs.showInfoDialog(Lang.upToDate)
                }
            })
        }
        this.checkUpdatesButton.submitSound = undefined
        this.checkUpdatesButton.keepMouseFocus = true /* prevent the focus jumping all over the place on press */
        if (isFullMode()) this.addChildGui(this.checkUpdatesButton)
    },
    initFiltersButton(bottomY) {
        this.filtersPopup = new modmanager.gui.FiltersPopup(() => {
            this.list.show()
        })
        this.filtersButton = new sc.ButtonGui('\\i[menu]' + Lang.filtersButton, 80, true, sc.BUTTON_TYPE.SMALL)
        this.filtersButton.setPos(480, bottomY)
        this.filtersButton.onButtonPress = () => {
            this.list.savePosition()
            this.filtersPopup.show()
        }
        this.filtersButton.keepMouseFocus = true /* prevent the focus jumping all over the place on press */
        this.addChildGui(this.filtersButton)
    },
    initTestingToggleButton() {
        this.testingToggleButton = new sc.ButtonGui(
            '',
            1 /* width will get dynamicly changed anyways */,
            true,
            sc.BUTTON_TYPE.SMALL
        )
        this.testingToggleButton.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP)
        this.testingToggleButton.setPos(264, 22)
        this.testingToggleButton.doStateTransition('HIDDEN')
        this.testingToggleButton.onButtonPress = () => {
            if (this.testingToggleButton.hook.currentStateName == 'DEFAULT') {
                const modEntry = this.getCurrentlyFocusedModEntry()!
                const mod = modEntry.mod
                const isOptedIn = ModDB.isModTestingOptIn(mod.id)

                const changeOptInStatus = (status: boolean) => {
                    ModDB.setModTestingOptInStatus(mod.id, status)
                    sc.BUTTON_SOUND[status ? 'toggle_on' : 'toggle_off'].play()
                    const localMod = mod.isLocal ? mod : mod.localCounterpart
                    const serverMod = mod.isLocal ? mod.serverCounterpart : mod
                    if (localMod) {
                        const oldHasUpdate = localMod.hasUpdate
                        localMod.hasUpdate = ModInstaller.checkLocalModForUpdate(localMod)

                        if (serverMod && InstallQueue.has(serverMod) && oldHasUpdate && !localMod.hasUpdate) {
                            modEntry.toggleSelection(true)
                        }
                    }

                    this.list.reloadEntries()
                }

                if (isOptedIn) {
                    changeOptInStatus(!isOptedIn)
                } else {
                    changeOptInStatus(!isOptedIn)
                }
            } else {
                sc.BUTTON_SOUND.denied.play()
            }
        }
        this.testingToggleButton.submitSound = undefined
        this.testingToggleButton.keepMouseFocus = true /* prevent the focus jumping all over the place on press */
        this.addChildGui(this.testingToggleButton)
    },
    initOpenRepositoryUrlButton() {
        this.openRepositoryUrlButton = new sc.ButtonGui(
            '\\i[left]' + Lang.openRepositoryUrl,
            140,
            true,
            sc.BUTTON_TYPE.SMALL
        )
        this.openRepositoryUrlButton.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP)
        this.openRepositoryUrlButton.setPos(10, 22)
        this.openRepositoryUrlButton.doStateTransition('HIDDEN')
        this.openRepositoryUrlButton.onButtonPress = () => {
            const tryPress = (): boolean => {
                if (this.openRepositoryUrlButton.hook.currentStateName != 'DEFAULT') return false
                const modEntry = this.getCurrentlyFocusedModEntry()!
                const mod = modEntry.mod
                if (!mod.repositoryUrl) return false
                openLink(mod.repositoryUrl)
                return true
            }
            sc.BUTTON_SOUND[tryPress() ? 'submit' : 'denied'].play()
        }
        this.openRepositoryUrlButton.submitSound = undefined
        this.openRepositoryUrlButton.keepMouseFocus = true /* prevent the focus jumping all over the place on press */
        this.addChildGui(this.openRepositoryUrlButton)
    },
    initModOptionsButton(bottomY) {
        this.modOptionsButton = new sc.ButtonGui(
            '\\i[rightClickOrR2]' + Lang.modOptions,
            140,
            true,
            sc.BUTTON_TYPE.SMALL
        )
        this.modOptionsButton.setPos(7, bottomY)
        this.modOptionsButton.doStateTransition('HIDDEN')
        this.modOptionsButton.onButtonPress = () => {
            const tryPress = (): boolean => {
                if (this.modOptionsButton.hook.currentStateName != 'DEFAULT') return false
                const modEntry = this.getCurrentlyFocusedModEntry()!
                const mod = modEntry.mod

                if (!modmanager.optionConfigs[mod.id]) return false

                this.openModSettings(mod)
                return true
            }
            sc.BUTTON_SOUND[tryPress() ? 'submit' : 'denied'].play()
        }
        this.modOptionsButton.submitSound = undefined
        this.modOptionsButton.keepMouseFocus = true /* prevent the focus jumping all over the place on press */
        this.addChildGui(this.modOptionsButton)
    },
    initChangelogButton() {
        this.changelogButton = new sc.ButtonGui('\\i[right]' + Lang.changelogButton, 100, true, sc.BUTTON_TYPE.SMALL)
        this.changelogButton.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP)
        this.changelogButton.setPos(155, 22)
        this.changelogButton.doStateTransition('HIDDEN')
        this.changelogButton.onButtonPress = () => {
            const tryPress = (): boolean => {
                if (this.changelogButton.hook.currentStateName != 'DEFAULT') return false
                const modEntry = this.getCurrentlyFocusedModEntry()!
                const mod = modEntry.mod

                const serverMod = mod.isLocal ? mod.serverCounterpart : mod
                if (!serverMod?.releasePages) return false

                this.openChangelogPopup(serverMod)
                return true
            }
            sc.BUTTON_SOUND[tryPress() ? 'submit' : 'denied'].play()
        }
        this.changelogButton.submitSound = undefined
        this.changelogButton.keepMouseFocus = true /* prevent the focus jumping all over the place on press */
        this.addChildGui(this.changelogButton)
    },

    isInMenuStack() {
        return sc.menu.menuStack.includes(sc.MENU_SUBMENU.MODS)
    },
    showModInstallDialog() {
        this.list.tabGroup._invokePressCallbacks(this.list.tabs[Lang.selectedModsTab], true)
        ModInstallDialogs.showModInstallDialog()
    },
    updateInstallButtonText() {
        const count = InstallQueue.values().length
        if (count > 0) {
            this.installButton.setText(
                '\\i[help4]' + Lang.installButton.replace(/\[modCount\]/, count.toString()),
                true
            )
        } else {
            this.installButton.setText(Lang.noModsSelected, true)
        }
        this.installButton.setActive(count > 0)
    },
    setTabEvent() {
        /* handle install button */
        if (!isFullMode() || this.list.currentTabIndex > modmanager.gui.MOD_MENU_TAB_INDEXES.SELECTED) {
            this.installButton.doStateTransition('HIDDEN')
            this.checkUpdatesButton.doStateTransition('HIDDEN')
        } else {
            this.installButton.doStateTransition('DEFAULT')
            this.checkUpdatesButton.doStateTransition('DEFAULT')
        }
    },
    addObservers() {
        sc.Model.addObserver(modmanager.gui.menu, this)
    },
    removeObservers() {
        sc.Model.removeObserver(modmanager.gui.menu, this)
    },
    modelChanged(model, message, data) {
        this.parent(model, message, data)
        if (model == modmanager.gui.menu) {
            if (message == modmanager.gui.MENU_MESSAGES.TAB_CHANGED) {
                this.setTabEvent()
            } else if (message == modmanager.gui.MENU_MESSAGES.SELECTED_ENTRIES_CHANGED) {
                this.updateInstallButtonText()
            } else if (message == modmanager.gui.MENU_MESSAGES.ENTRY_FOCUSED) {
                const entry = data as modmanager.gui.ListEntry
                if (entry.mod.isLocal || (entry.mod.localCounterpart && isFullMode()))
                    this.uninstallButton.setActive(true)

                const serverMod = entry.mod.isLocal ? entry.mod.serverCounterpart : entry.mod
                if (serverMod?.testingVersion) {
                    this.testingToggleButton.doStateTransition('DEFAULT')
                    this.testingToggleButton.setText('\\i[shiftOrL2] ' + Lang.testingButton)
                } else {
                    this.testingToggleButton.doStateTransition('HIDDEN')
                }

                this.openRepositoryUrlButton.doStateTransition(entry.mod.repositoryUrl ? 'DEFAULT' : 'HIDDEN')

                this.modOptionsButton.doStateTransition(modmanager.optionConfigs[entry.mod.id] ? 'DEFAULT' : 'HIDDEN')

                this.changelogButton.doStateTransition(serverMod?.releasePages ? 'DEFAULT' : 'HIDDEN')
            } else if (message == modmanager.gui.MENU_MESSAGES.ENTRY_UNFOCUSED) {
                this.uninstallButton.setActive(false)

                this.testingToggleButton.doStateTransition('HIDDEN')
                this.openRepositoryUrlButton.doStateTransition('HIDDEN')
                this.modOptionsButton.doStateTransition('HIDDEN')
                this.changelogButton.doStateTransition('HIDDEN')
            }
        }
    },
    setBlackBarVisibility(visible) {
        const state = visible ? 'DEFAULT' : 'HIDDEN'
        const main = sc.menu.guiReference
        if (main?.info) main.info.doStateTransition(state)
        if (main?.topBar) main.topBar.doStateTransition(state)
    },
    setAllVisibility(visible) {
        const state = visible ? 'DEFAULT' : 'HIDDEN'

        if (!visible || isFullMode()) {
            this.installButton.doStateTransition(state)
            this.uninstallButton.doStateTransition(state)
            this.checkUpdatesButton.doStateTransition(state)
        }
        this.inputField.doStateTransition(state)
        this.filtersButton.doStateTransition(state)
        if (!visible) {
            this.testingToggleButton.doStateTransition(state)
            this.openRepositoryUrlButton.doStateTransition(state)
            this.modOptionsButton.doStateTransition(state)
            this.changelogButton.doStateTransition(state)
        }

        const main = sc.menu.guiReference
        if (main?.info) main.info.doStateTransition(state)
        if (main?.topBar) main.topBar.doStateTransition(state)
    },
    showMenu(previousMenu, prevSubmenu) {
        this.parent(previousMenu, prevSubmenu)
        if (prevSubmenu != sc.MENU_SUBMENU.OPTIONS) sc.menu.popBackCallback()

        this.setAllVisibility(true)
        this.setBlackBarVisibility(false)

        /* this NOT is how it's supposed to work but it works so */
        sc.menu.buttonInteract.addGlobalButton(this.inputField as any, () => false)

        if (isFullMode()) {
            sc.menu.buttonInteract.addGlobalButton(this.installButton, () => sc.control.menuHotkeyHelp4())
            sc.menu.buttonInteract.addGlobalButton(this.uninstallButton, () => sc.control.menuHotkeyHelp2())
            sc.menu.buttonInteract.addGlobalButton(this.checkUpdatesButton, () => false)
        }
        sc.menu.buttonInteract.addGlobalButton(this.filtersButton, () => sc.control.menu())
        sc.menu.buttonInteract.addGlobalButton(
            this.testingToggleButton,
            () => ig.input.pressed('quick') || ig.gamepad.isButtonPressed(ig.BUTTONS.LEFT_TRIGGER)
        )
        sc.menu.buttonInteract.addGlobalButton(this.openRepositoryUrlButton, () => sc.control.leftPressed())
        sc.menu.buttonInteract.addGlobalButton(this.changelogButton, () => sc.control.rightPressed())
        sc.menu.buttonInteract.addGlobalButton(
            this.modOptionsButton,
            () => ig.input.pressed('special') /* space bar */ || ig.gamepad.isButtonPressed(ig.BUTTONS.RIGHT_TRIGGER)
        )

        new modmanager.gui.ManualEnforcer('ModManagerManual', Lang.help.title, Lang.help.pages)
    },
    hideMenu() {
        this.parent()
        this.setAllVisibility(false)
        this.setBlackBarVisibility(true)

        sc.menu.buttonInteract.removeGlobalButton(this.inputField as any)
        sc.menu.buttonInteract.removeGlobalButton(this.installButton)
        sc.menu.buttonInteract.removeGlobalButton(this.uninstallButton)
        sc.menu.buttonInteract.removeGlobalButton(this.checkUpdatesButton)
        sc.menu.buttonInteract.removeGlobalButton(this.filtersButton)
        sc.menu.buttonInteract.removeGlobalButton(this.testingToggleButton)
        sc.menu.buttonInteract.removeGlobalButton(this.openRepositoryUrlButton)
        sc.menu.buttonInteract.removeGlobalButton(this.modOptionsButton)
        sc.menu.buttonInteract.removeGlobalButton(this.changelogButton)

        if (
            LocalMods.getAll().some(mod => mod.awaitingRestart) ||
            Object.values(ModDB.databases).some(
                db => db.active && Object.values(db.modRecord ?? {}).some(mod => mod.awaitingRestart)
            )
        ) {
            sc.Dialogs.showYesNoDialog(Lang.modStatesChanged, sc.DIALOG_INFO_ICON.QUESTION, button => {
                if (button.data == 0) {
                    ModInstaller.restartGame()
                }
            })
        }
    },
    createHelpGui() {
        if (!this.helpGui) {
            this.helpGui = new sc.HelpScreen(
                this,
                Lang.help.title,
                Lang.help.pages,
                () => {
                    this.showMenu()
                    sc.menu.popBackCallback()
                    sc.menu.popBackCallback()
                },
                true
            )
            this.helpGui.hook.zIndex = 15e4
            this.helpGui.hook.pauseGui = true
        }
    },
    getCurrentlyFocusedModEntry() {
        return this.list.currentList.buttonGroup.elements
            .reduce((acc, v) => {
                acc.push(...v)
                return acc
            }, [])
            .find((b: ig.FocusGui) => b.focus) as modmanager.gui.ListEntry
    },
    openModSettings(mod) {
        this.list.savePosition()
        sc.menu.pushMenu(sc.MENU_SUBMENU.MOD_OPTIONS)
        modmanager.gui.optionsMenu.updateEntries(mod)
    },
    openChangelogPopup(mod) {
        this.changelogPopup ??= new modmanager.gui.Changelog()
        this.changelogPopup.setMod(mod)
        this.changelogPopup.openMenu()
    },
    update() {
        this.parent()
        if (this.modOptionsButton.hook.currentStateName == 'DEFAULT' && ig.input.pressed('dash')) {
            this.modOptionsButton.invokeButtonPress()
        }
    },
})

// @ts-expect-error
sc.MENU_SUBMENU.MODS = Math.max(...Object.values(sc.MENU_SUBMENU)) + 1

const modsMenuId = 'mods'
sc.SUB_MENU_INFO[sc.MENU_SUBMENU.MODS] = {
    Clazz: modmanager.gui.Menu,
    name: modsMenuId,
}
