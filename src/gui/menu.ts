import 'nax-ccuilib/src/headers/nax/input-field.d.ts'
import 'nax-ccuilib/src/headers/nax/input-field-cursor.d.ts'
import 'nax-ccuilib/src/headers/nax/input-field-type.d.ts'
import './list'
import { ModDB } from '../moddb'
import { MOD_MENU_TAB_INDEXES } from './list'
import { InstallQueue, ModInstaller } from '../mod-installer'
import { ModEntry, ModEntryLocal } from '../types'
import { ModInstallDialogs } from './install-dialogs'

declare global {
    namespace sc {
        enum MOD_MENU_SORT_ORDER {
            NAME,
            NAME_REVERSE,
            STARS,
        }
        enum MOD_MENU_MESSAGES {
            SELECTED_ENTRIES_CHANGED,
            TAB_CHANGED,
            REPOSITORY_CHANGED,
            UPDATE_ENTRIES,
            ENTRY_FOCUSED,
            ENTRY_UNFOCUSED,
        }
        interface ModMenu extends sc.ListInfoMenu, sc.Model {
            list: ModMenuList
            inputField: nax.ccuilib.InputField
            installButton: sc.ButtonGui
            includeLocalCheckbox: sc.CheckboxGui
            includeLocalText: sc.TextGui
            uninstallButton: sc.ButtonGui
            checkUpdatesButton: sc.ButtonGui

            updateInstallButtonText(this: this): void
            onBackButtonPress(this: this): void
            setTabEvent(this: this): void
            showModInstallDialog(this: this): void
            showModUninstallDialog(this: this, localMod: ModEntryLocal): void
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
    NAME_REVERSE: 1,
    STARS: 2,
}
sc.MOD_MENU_MESSAGES = {
    SELECTED_ENTRIES_CHANGED: 0,
    TAB_CHANGED: 1,
    REPOSITORY_CHANGED: 2,
    UPDATE_ENTRIES: 3,
    ENTRY_FOCUSED: 4,
    ENTRY_UNFOCUSED: 5,
}

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
        /* i dont think this is how it's supposed to work but it works so */
        sc.menu.buttonInteract.addGlobalButton(this.inputField as any, () => false)

        this.sortMenu.addButton('name', sc.MOD_MENU_SORT_ORDER.NAME, sc.MOD_MENU_SORT_ORDER.NAME)
        this.sortMenu.addButton('nameReverse', sc.MOD_MENU_SORT_ORDER.NAME_REVERSE, sc.MOD_MENU_SORT_ORDER.NAME_REVERSE)
        this.sortMenu.addButton('stars', sc.MOD_MENU_SORT_ORDER.STARS, sc.MOD_MENU_SORT_ORDER.STARS)

        const legacyCheckbox = new sc.CheckboxGui((this.list.filters.includeLegacy = true))
        legacyCheckbox.setPos(9, 282)
        legacyCheckbox.onButtonPress = () => {
            this.list.filters.includeLegacy = legacyCheckbox.pressed
            this.list.reloadFilters()
        }
        this.addChildGui(legacyCheckbox)
        sc.menu.buttonInteract.addGlobalButton(legacyCheckbox, () => false)
        const legacyText = new sc.TextGui('Include legacy mods')
        legacyText.setPos(35, 282)
        this.addChildGui(legacyText)

        this.includeLocalCheckbox = new sc.CheckboxGui((this.list.filters.includeLocal = false))
        this.includeLocalCheckbox.setPos(9, 300)
        this.includeLocalCheckbox.onButtonPress = () => {
            this.list.filters.includeLocal = this.includeLocalCheckbox.pressed
            this.list.reloadFilters()
        }
        this.addChildGui(this.includeLocalCheckbox)
        sc.menu.buttonInteract.addGlobalButton(this.includeLocalCheckbox, () => false)
        this.includeLocalText = new sc.TextGui('Include local')
        this.includeLocalText.hook.transitions['HIDDEN'] = this.includeLocalCheckbox.hook.transitions['HIDDEN']
        this.includeLocalText.setPos(35, 300)
        this.addChildGui(this.includeLocalText)

        this.installButton = new sc.ButtonGui('', 128, true, sc.BUTTON_TYPE.SMALL)
        this.updateInstallButtonText()
        this.installButton.setPos(340, 22)
        this.installButton.onButtonPress = () => {
            if (this.list.currentTabIndex == MOD_MENU_TAB_INDEXES.SELECTED) sc.BUTTON_SOUND.submit.play()
            ModInstaller.findDeps(InstallQueue.values(), ModDB.modRecord)
                .catch(err => sc.Dialogs.showErrorDialog(err))
                .then(() => this.showModInstallDialog())
        }
        this.installButton.submitSound = undefined
        this.addChildGui(this.installButton)
        sc.menu.buttonInteract.addGlobalButton(this.installButton, () => sc.control.menuHotkeyHelp4())

        this.uninstallButton = new sc.ButtonGui('\\i[help2]Uninstall', 85, true, sc.BUTTON_TYPE.SMALL)
        this.uninstallButton.setPos(475, 22)
        this.uninstallButton.onButtonPress = () => {
            const mod: ModEntry = (this.list.currentList.buttonGroup.elements[0].find((b: ig.FocusGui) => b.focus) as sc.ModListEntry).mod
            const localMod = mod.isLocal ? mod : mod.localCounterpart
            if (localMod /* this should ALWAYS be true but anyways */) {
                this.showModUninstallDialog(localMod)
            }
        }
        this.uninstallButton.keepMouseFocus = true /* prevent the focus jumping all over the place on press */
        this.addChildGui(this.uninstallButton)
        sc.menu.buttonInteract.addGlobalButton(this.uninstallButton, () => sc.control.menuHotkeyHelp2())

        this.checkUpdatesButton = new sc.ButtonGui('Check updates', 100, true, sc.BUTTON_TYPE.SMALL)
        this.checkUpdatesButton.setPos(235, 22)
        this.checkUpdatesButton.onButtonPress = () => {
            ModInstaller.checkAllLocalModsForUpdate(true)
        }
        this.checkUpdatesButton.keepMouseFocus = true /* prevent the focus jumping all over the place on press */
        this.addChildGui(this.checkUpdatesButton)
        sc.menu.buttonInteract.addGlobalButton(this.checkUpdatesButton, () => false)

        this.setTabEvent()
    },
    showModInstallDialog() {
        this.list.tabGroup._invokePressCallbacks(this.list.tabs[ig.lang.get('sc.gui.menu.ccmodloader.selectedModsTab')], true)
        ModInstallDialogs.showModInstallDialog()
    },
    showModUninstallDialog(localMod) {
        ModInstallDialogs.showModUninstallDialog(localMod)
    },
    updateInstallButtonText() {
        const count = InstallQueue.values().length
        if (count > 0) {
            this.installButton.setText('\\i[help4]' + ig.lang.get('sc.gui.menu.ccmodloader.installButton').replace(/\[modCount\]/, count.toString()), true)
        } else {
            this.installButton.setText(ig.lang.get('sc.gui.menu.ccmodloader.noModsSelected'), true)
        }
        this.installButton.setActive(count > 0)
    },
    setTabEvent() {
        /* handle filters */
        if (this.list.currentTabIndex == MOD_MENU_TAB_INDEXES.ONLINE) {
            this.includeLocalText.doStateTransition('DEFAULT')
            this.includeLocalCheckbox.doStateTransition('DEFAULT')
        } else {
            this.includeLocalText.doStateTransition('HIDDEN')
            this.includeLocalCheckbox.doStateTransition('HIDDEN')
        }

        /* handle install button */
        if (this.list.currentTabIndex > MOD_MENU_TAB_INDEXES.SELECTED) {
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
    showMenu() {
        this.parent()
        sc.menu.pushBackCallback(() => this.onBackButtonPress())
        sc.menu.moveLeaSprite(0, 0, sc.MENU_LEA_STATE.HIDDEN)
    },
    hideMenu() {
        this.parent()
        sc.menu.moveLeaSprite(0, 0, sc.MENU_LEA_STATE.LARGE)
        this.exitMenu()
    },
    exitMenu() {
        this.parent()
    },
    onBackButtonPress() {
        sc.menu.popBackCallback()
        sc.menu.popMenu()
    },
})
