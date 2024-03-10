import 'nax-ccuilib/src/headers/nax/input-field.d.ts'
import 'nax-ccuilib/src/headers/nax/input-field-cursor.d.ts'
import 'nax-ccuilib/src/headers/nax/input-field-type.d.ts'
import './list'
import './filters'
import { ModDB } from '../moddb'
import { InstallQueue, ModInstaller } from '../mod-installer'
import { ModEntry } from '../types'
import { ModInstallDialogs } from './install-dialogs'
import { LocalMods } from '../local-mods'
import { Lang } from '../lang-manager'

declare global {
    namespace sc {
        enum MOD_MENU_SORT_ORDER {
            NAME,
            STARS,
            LAST_UPDATED,
        }
        enum MOD_MENU_MESSAGES {
            SELECTED_ENTRIES_CHANGED,
            TAB_CHANGED,
            REPOSITORY_CHANGED,
            UPDATE_ENTRIES,
            ENTRY_FOCUSED,
            ENTRY_UNFOCUSED,
            ENTRY_UPDATE_COLOR,
        }
        interface ModMenu extends sc.ListInfoMenu, sc.Model {
            list: ModMenuList
            inputField: nax.ccuilib.InputField
            installButton: sc.ButtonGui
            uninstallButton: sc.ButtonGui
            checkUpdatesButton: sc.ButtonGui
            filtersButton: sc.ButtonGui
            filtersPopup: sc.FiltersPopup

            setBlackBarVisibility(this: this, visible: boolean): void
            setAllVisibility(this: this, visible: boolean): void
            updateInstallButtonText(this: this): void
            onBackButtonPress(this: this): void
            setTabEvent(this: this): void
            showModInstallDialog(this: this): void
        }
        interface ModMenuConstructor extends ImpactClass<ModMenu> {
            new (): ModMenu
        }
        var ModMenu: ModMenuConstructor
        var modMenu: ModMenu
    }
}
sc.MOD_MENU_SORT_ORDER = {
    NAME: 0,
    STARS: 1,
    LAST_UPDATED: 2,
}
sc.MOD_MENU_MESSAGES = {
    SELECTED_ENTRIES_CHANGED: 0,
    TAB_CHANGED: 1,
    REPOSITORY_CHANGED: 2,
    UPDATE_ENTRIES: 3,
    ENTRY_FOCUSED: 4,
    ENTRY_UNFOCUSED: 5,
    ENTRY_UPDATE_COLOR: 6,
}

sc.GlobalInput.inject({
    onPostUpdate() {
        if (sc.menu.currentMenu == sc.MENU_SUBMENU.MODS && sc.control.menu()) return
        this.parent()
    },
})

sc.ModMenu = sc.ListInfoMenu.extend({
    observers: [],
    init() {
        sc.modMenu = this
        ModDB.loadDatabases()
        this.parent(new sc.ModMenuList())
        this.list.setPos(9, 23)

        this.inputField = new nax.ccuilib.InputField(232, 20)
        this.inputField.setPos(124, 2)
        this.inputField.onCharacterInput = str => {
            this.list.filters.name = str
            this.list.reloadFilters()
        }
        this.addChildGui(this.inputField)
        /* this NOT is how it's supposed to work but it works so */
        sc.menu.buttonInteract.addGlobalButton(this.inputField as any, () => false)

        this.sortMenu.addButton('name', sc.MOD_MENU_SORT_ORDER.NAME, sc.MOD_MENU_SORT_ORDER.NAME)
        this.sortMenu.addButton('stars', sc.MOD_MENU_SORT_ORDER.STARS, sc.MOD_MENU_SORT_ORDER.STARS)
        this.sortMenu.addButton('lastUpdated', sc.MOD_MENU_SORT_ORDER.LAST_UPDATED, sc.MOD_MENU_SORT_ORDER.LAST_UPDATED)

        const bottomY = 285
        this.installButton = new sc.ButtonGui('', 128, true, sc.BUTTON_TYPE.SMALL)
        this.updateInstallButtonText()
        this.installButton.setPos(152, bottomY)
        this.installButton.onButtonPress = () => {
            if (this.list.currentTabIndex == sc.MOD_MENU_TAB_INDEXES.SELECTED) sc.BUTTON_SOUND.submit.play()
            ModInstaller.findDepsDatabase(InstallQueue.values(), ModDB.modRecord)
                .then(mods => {
                    InstallQueue.add(...mods)
                    this.showModInstallDialog()
                })
                .catch(err => sc.Dialogs.showErrorDialog(err))
        }
        this.installButton.submitSound = undefined
        this.addChildGui(this.installButton)
        sc.menu.buttonInteract.addGlobalButton(this.installButton, () => sc.control.menuHotkeyHelp4())

        this.inputField.hook.transitions['HIDDEN'] = this.installButton.hook.transitions['HIDDEN']

        this.uninstallButton = new sc.ButtonGui('\\i[help2]' + Lang.uninstall, 85, true, sc.BUTTON_TYPE.SMALL)
        this.uninstallButton.setPos(390, bottomY)
        this.uninstallButton.onButtonPress = () => {
            const mod: ModEntry = (
                this.list.currentList.buttonGroup.elements
                    .reduce((acc, v) => {
                        acc.push(...v)
                        return acc
                    }, [])
                    .find((b: ig.FocusGui) => b.focus) as sc.ModListEntry
            ).mod
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
        this.addChildGui(this.uninstallButton)
        sc.menu.buttonInteract.addGlobalButton(this.uninstallButton, () => sc.control.menuHotkeyHelp2())

        this.checkUpdatesButton = new sc.ButtonGui(Lang.checkUpdates, 100, true, sc.BUTTON_TYPE.SMALL)
        this.checkUpdatesButton.setPos(285, bottomY)
        this.checkUpdatesButton.onButtonPress = () => {
            if (this.list.currentTabIndex == sc.MOD_MENU_TAB_INDEXES.SELECTED) sc.BUTTON_SOUND.submit.play()
            ModInstaller.appendToUpdateModsToQueue().then(hasUpdated => {
                if (hasUpdated) {
                    sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.UPDATE_ENTRIES)
                    this.list.tabGroup._invokePressCallbacks(this.list.tabs[Lang.selectedModsTab], true)
                    sc.Dialogs.showInfoDialog(Lang.updatesFound)
                } else {
                    sc.Dialogs.showInfoDialog(Lang.upToDate)
                }
            })
        }
        this.checkUpdatesButton.submitSound = undefined
        this.checkUpdatesButton.keepMouseFocus = true /* prevent the focus jumping all over the place on press */
        this.addChildGui(this.checkUpdatesButton)
        sc.menu.buttonInteract.addGlobalButton(this.checkUpdatesButton, () => false)

        this.filtersPopup = new sc.FiltersPopup()
        this.filtersButton = new sc.ButtonGui('\\i[menu]' + Lang.filtersButton, 80, true, sc.BUTTON_TYPE.SMALL)
        this.filtersButton.setPos(480, bottomY)
        this.filtersButton.onButtonPress = () => {
            this.filtersPopup.show()
        }
        this.filtersButton.keepMouseFocus = true /* prevent the focus jumping all over the place on press */
        this.addChildGui(this.filtersButton)
        sc.menu.buttonInteract.addGlobalButton(this.filtersButton, () => sc.control.menu())

        this.setTabEvent()
    },
    showModInstallDialog() {
        this.list.tabGroup._invokePressCallbacks(this.list.tabs[Lang.selectedModsTab], true)
        ModInstallDialogs.showModInstallDialog()
    },
    updateInstallButtonText() {
        const count = InstallQueue.values().length
        if (count > 0) {
            this.installButton.setText('\\i[help4]' + Lang.installButton.replace(/\[modCount\]/, count.toString()), true)
        } else {
            this.installButton.setText(Lang.noModsSelected, true)
        }
        this.installButton.setActive(count > 0)
    },
    setTabEvent() {
        /* handle install button */
        if (this.list.currentTabIndex > sc.MOD_MENU_TAB_INDEXES.SELECTED) {
            this.installButton.doStateTransition('HIDDEN')
            this.checkUpdatesButton.doStateTransition('HIDDEN')
        } else {
            this.installButton.doStateTransition('DEFAULT')
            this.checkUpdatesButton.doStateTransition('DEFAULT')
        }
    },
    addObservers() {
        sc.Model.addObserver(sc.modMenu, this)
    },
    removeObservers() {
        sc.Model.addObserver(sc.modMenu, this)
    },
    modelChanged(model, message, data) {
        this.parent(model, message, data)
        if (model == sc.modMenu) {
            if (message == sc.MOD_MENU_MESSAGES.TAB_CHANGED) {
                this.setTabEvent()
            } else if (message == sc.MOD_MENU_MESSAGES.SELECTED_ENTRIES_CHANGED) {
                this.updateInstallButtonText()
            } else if (message == sc.MOD_MENU_MESSAGES.ENTRY_FOCUSED) {
                const entry = data as sc.ModListEntry
                if (entry.mod.isLocal || entry.mod.localCounterpart) this.uninstallButton.setActive(true)
            } else if (message == sc.MOD_MENU_MESSAGES.ENTRY_UNFOCUSED) {
                this.uninstallButton.setActive(false)
            }
        }
    },
    setBlackBarVisibility(visible) {
        const state = visible ? 'DEFAULT' : 'HIDDEN'
        const main = ig.gui.guiHooks.find(h => h.gui instanceof sc.MainMenu)?.gui as sc.MainMenu | undefined
        if (main?.info) main.info.doStateTransition(state)
        if (main?.topBar) main.topBar.doStateTransition(state)
    },
    setAllVisibility(visible) {
        const state = visible ? 'DEFAULT' : 'HIDDEN'

        this.installButton.doStateTransition(state)
        this.uninstallButton.doStateTransition(state)
        this.checkUpdatesButton.doStateTransition(state)
        this.inputField.doStateTransition(state)
        this.filtersButton.doStateTransition(state)

        const main = ig.gui.guiHooks.find(h => h.gui instanceof sc.MainMenu)?.gui as sc.MainMenu | undefined
        if (main?.info) main.info.doStateTransition(state)
        if (main?.topBar) main.topBar.doStateTransition(state)
    },
    showMenu() {
        this.parent()
        sc.menu.pushBackCallback(() => this.onBackButtonPress())
        sc.menu.moveLeaSprite(0, 0, sc.MENU_LEA_STATE.HIDDEN)

        this.setAllVisibility(true)
        this.setBlackBarVisibility(false)
    },
    hideMenu() {
        this.parent()
        sc.menu.moveLeaSprite(0, 0, sc.MENU_LEA_STATE.LARGE)
        this.exitMenu()
        this.setAllVisibility(false)
        this.setBlackBarVisibility(true)

        if (
            LocalMods.getAll().some(mod => mod.awaitingRestart) ||
            Object.values(ModDB.databases).some(db => db.active && Object.values(db.modRecord).some(mod => mod.awaitingRestart))
        ) {
            sc.Dialogs.showYesNoDialog(Lang.modStatesChanged, sc.DIALOG_INFO_ICON.QUESTION, button => {
                if (button.data == 0) {
                    ModInstaller.restartGame()
                }
            })
        }
    },
    onBackButtonPress() {
        sc.menu.popBackCallback()
        sc.menu.popMenu()
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
})
