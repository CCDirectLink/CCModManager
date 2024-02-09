import 'nax-ccuilib/src/headers/nax/input-field.d.ts'
import 'nax-ccuilib/src/headers/nax/input-field-cursor.d.ts'
import 'nax-ccuilib/src/headers/nax/input-field-type.d.ts'
import { InstallQueue } from '../install-queue'
import './list'
import { ModDB } from '../moddb'
import { MOD_MENU_TAB_INDEXES } from './list'

declare global {
    namespace sc {
        enum MOD_MENU_SORT_ORDER {
            NAME,
            NAME_REVERSE,
            STARS,
        }
        interface ModMenu extends sc.ListInfoMenu {
            list: ModMenuList
            inputField: nax.ccuilib.InputField
            installButton: sc.ButtonGui
            includeLocalCheckbox: sc.CheckboxGui
            includeLocalText: sc.TextGui

            onBackButtonPress(this: this): void
            setTabEvent(this: this): void
        }
        interface ModMenuConstructor extends ImpactClass<ModMenu> {
            new (): ModMenu
        }
        var ModMenu: ModMenuConstructor
    }
}
sc.MOD_MENU_SORT_ORDER = {
    NAME: 0,
    NAME_REVERSE: 1,
    STARS: 2,
}

sc.ModMenu = sc.ListInfoMenu.extend({
    init() {
        ModDB.loadDatabases()
        this.parent(new sc.ModMenuList(this))
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
        InstallQueue.changeListeners.push(() => this.setTabEvent())
        this.setTabEvent()
        this.installButton.setPos(432, 22)
        this.addChildGui(this.installButton)
        sc.menu.buttonInteract.addGlobalButton(this.installButton, () => false)
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
            const count = InstallQueue.values().length
            this.installButton.setActive(count > 0)
            if (count > 0) {
                // prettier-ignore
                this.installButton.setText(
            ig.lang.get('sc.gui.menu.ccmodloader.installButton')
            .replace(/\[modCount\]/, count.toString()), true
            )
            } else {
                this.installButton.setText(ig.lang.get('sc.gui.menu.ccmodloader.noModsSelected'), true)
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
