import 'nax-ccuilib/src/headers/nax/input-field.d.ts'
import 'nax-ccuilib/src/headers/nax/input-field-cursor.d.ts'
import 'nax-ccuilib/src/headers/nax/input-field-type.d.ts'
import './list'
import { ModDB } from '../moddb'
import { MOD_MENU_TAB_INDEXES } from './list'
import { InstallQueue, ModInstaller } from '../mod-installer'

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
            READY_TO_INSTALL,
        }
        interface ModMenu extends sc.ListInfoMenu, sc.Model {
            list: ModMenuList
            inputField: nax.ccuilib.InputField
            installButton: sc.ButtonGui
            includeLocalCheckbox: sc.CheckboxGui
            includeLocalText: sc.TextGui

            updateInstallButtonText(this: this): void
            onBackButtonPress(this: this): void
            setTabEvent(this: this): void
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
    READY_TO_INSTALL: 3,
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
        this.installButton.setPos(432, 22)
        this.installButton.onButtonPress = () => {
            ModInstaller.findDeps(this.list.mods)
        }
        this.addChildGui(this.installButton)
        sc.menu.buttonInteract.addGlobalButton(this.installButton, () => false)

        this.setTabEvent()
    },
    updateInstallButtonText() {
        const count = InstallQueue.values().length
        this.installButton.setActive(count > 0)
        if (count > 0) {
            this.installButton.setText(ig.lang.get('sc.gui.menu.ccmodloader.installButton').replace(/\[modCount\]/, count.toString()), true)
        } else {
            this.installButton.setText(ig.lang.get('sc.gui.menu.ccmodloader.noModsSelected'), true)
        }
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
    modelChanged(model, message, data) {
        this.parent(model, message, data)
        if (model == sc.modMenu) {
            if (message == sc.MOD_MENU_MESSAGES.TAB_CHANGED) {
                this.setTabEvent()
            } else if (message == sc.MOD_MENU_MESSAGES.SELECTED_ENTRIES_CHANGED) {
                this.updateInstallButtonText()
            } else if (message == sc.MOD_MENU_MESSAGES.READY_TO_INSTALL) {
                this.list.tabGroup._invokePressCallbacks(this.list.tabs[ig.lang.get('sc.gui.menu.ccmodloader.selectedModsTab')], true)
                const nod: string = ig.LangLabel.getText({
                    en_US: '[nods]',
                    de_DE: '[nickt]',
                    zh_CN: '[\u70b9\u5934]<<A<<[CHANGED 2017/10/10]',
                    ko_KR: '[\ub044\ub355]<<A<<[CHANGED 2017/10/17]',
                    ja_JP: '[\u3046\u306a\u305a\u304f]<<A<<[CHANGED 2017/11/04]',
                    zh_TW: '[\u9ede\u982d]<<A<<[CHANGED 2017/10/10]',
                })
                const deps = InstallQueue.deps
                const str = `Are you sure you want to install:\n${InstallQueue.values()
                    .map(mod => `- \\c[3]${mod.name}\\c[0]\n`)
                    .join()}${deps.length > 0 ? `Dependencies:\n${deps.map(mod => `- \\c[3]${mod.name}\\c[0]\n`)}` : ''}`

                sc.Dialogs.showChoiceDialog(str, sc.DIALOG_INFO_ICON.QUESTION, [ig.lang.get('sc.gui.dialogs.no'), nod], button => {
                    if (button.text!.toString() == nod) {
                        const toInstall = InstallQueue.deps.concat(InstallQueue.values())
                        ModInstaller.install(toInstall).then(() => {
                            InstallQueue.deps = []
                            InstallQueue.clear()
                            sc.Dialogs.showYesNoDialog(
                                'The installed mods will start working after a restart.\nDo you want to restart?',
                                sc.DIALOG_INFO_ICON.QUESTION,
                                button => {
                                    const text = button.text!.toString()
                                    if (text == ig.lang.get('sc.gui.dialogs.yes')) {
                                        if ('chrome' in window) (window.chrome as any).runtime.reload()
                                        else window.location.reload()
                                    } else {
                                        toInstall.forEach(mod => {
                                            mod.awaitingRestart = true
                                        })
                                    }
                                }
                            )
                        })
                    }
                })
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
