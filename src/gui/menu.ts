import 'nax-ccuilib/src/headers/nax/input-field.d.ts'
import 'nax-ccuilib/src/headers/nax/input-field-cursor.d.ts'
import 'nax-ccuilib/src/headers/nax/input-field-type.d.ts'
import './list'
import { ModDB } from '../moddb'
import { MOD_MENU_TAB_INDEXES } from './list'
import { InstallQueue, ModInstaller } from '../mod-installer'
import { ModEntry, ModEntryLocal } from '../types'

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

function getNod() {
    return ig.LangLabel.getText({
        en_US: '[nods]',
        de_DE: '[nickt]',
        zh_CN: '[\u70b9\u5934]<<A<<[CHANGED 2017/10/10]',
        ko_KR: '[\ub044\ub355]<<A<<[CHANGED 2017/10/17]',
        ja_JP: '[\u3046\u306a\u305a\u304f]<<A<<[CHANGED 2017/11/04]',
        zh_TW: '[\u9ede\u982d]<<A<<[CHANGED 2017/10/10]',
    })
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
            ModInstaller.findDeps(InstallQueue.values(), this.list.mods)
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
                // ModInstaller.findDeps(
                //
                //     this.list.mods,
                //     false
                // )
                //     .catch(err => sc.Dialogs.showErrorDialog(err))
                //     .then(() => this.showModUninstallDialog())
            }
        }
        this.uninstallButton.keepMouseFocus = true /* prevent the focus jumping all over the place on press */
        this.addChildGui(this.uninstallButton)
        sc.menu.buttonInteract.addGlobalButton(this.uninstallButton, () => sc.control.menuHotkeyHelp2())

        this.setTabEvent()
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
        } else {
            this.installButton.doStateTransition('DEFAULT')
        }
    },
    addObservers() {
        sc.Model.addObserver(sc.modMenu, this)
    },
    removeObservers() {
        sc.Model.addObserver(sc.modMenu, this)
    },
    showModInstallDialog() {
        this.list.tabGroup._invokePressCallbacks(this.list.tabs[ig.lang.get('sc.gui.menu.ccmodloader.selectedModsTab')], true)
        const deps = InstallQueue.deps
        const str = `${ig.lang.get('sc.gui.menu.ccmodloader.areYouSureYouWantToInstall')}\n${InstallQueue.values()
            .map(mod => `- \\c[3]${mod.name.replace(/\\c\[\d]/g, '')}\\c[0]\n`)
            .join(
                ''
            )}${deps.length > 0 ? `${ig.lang.get('sc.gui.menu.ccmodloader.dependencies')}\n${deps.map(mod => `- \\c[3]${mod.name.replace(/\\c\[\d]/g, '')}\\c[0]\n`)}` : ''}`

        sc.Dialogs.showChoiceDialog(str, sc.DIALOG_INFO_ICON.QUESTION, [getNod(), ig.lang.get('sc.gui.dialogs.no')], button => {
            if (button.text!.toString() == getNod()) {
                const toInstall = InstallQueue.deps.concat(InstallQueue.values())
                ModInstaller.install(toInstall)
                    .then(() => {
                        InstallQueue.deps = []
                        InstallQueue.clear()
                        sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.UPDATE_ENTRIES)
                        sc.Dialogs.showYesNoDialog(ig.lang.get('sc.gui.menu.ccmodloader.askRestartInstall'), sc.DIALOG_INFO_ICON.QUESTION, button => {
                            const text = button.text!.toString()
                            if (text == ig.lang.get('sc.gui.dialogs.yes')) {
                                ModInstaller.restartGame()
                            } else {
                                toInstall.forEach(mod => {
                                    mod.awaitingRestart = true
                                })
                            }
                        })
                    })
                    .catch(err => {
                        sc.Dialogs.showErrorDialog(err)
                    })
            }
        })
    },
    showModUninstallDialog(localMod) {
        const deps = ModInstaller.getWhatDependsOnAMod(localMod)
        if (deps.length == 0) {
            const str = ig.lang.get('sc.gui.menu.ccmodloader.areYouSureYouWantToUninstall').replace(/\[modName\]/, localMod.name.replace(/\\c\[\d]/g, ''))
            sc.Dialogs.showChoiceDialog(str, sc.DIALOG_INFO_ICON.QUESTION, [getNod(), ig.lang.get('sc.gui.dialogs.no')], button => {
                if (button.text!.toString() == getNod()) {
                    ModInstaller.uninstallMod(localMod).then(() => {
                        localMod.awaitingRestart = true
                        localMod.active = false
                        sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.UPDATE_ENTRIES)

                        sc.Dialogs.showYesNoDialog(ig.lang.get('sc.gui.menu.ccmodloader.askRestartUninstall'), sc.DIALOG_INFO_ICON.QUESTION, button => {
                            const text = button.text!.toString()
                            if (text == ig.lang.get('sc.gui.dialogs.yes')) {
                                ModInstaller.restartGame()
                            }
                        })
                    })
                }
            })
        } else {
            sc.Dialogs.showErrorDialog(
                ig.lang.get('sc.gui.menu.ccmodloader.cannotUninstall').replace(/\[modName\]/, localMod.name) +
                    deps.map(mod => `- \\c[3]${mod.name.replace(/\\c\[\d]/g, '')}\\c[0]\n`).join('')
            )
        }
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
