import 'nax-ccuilib/src/headers/nax/input-field.d.ts'
import 'nax-ccuilib/src/headers/nax/input-field-cursor.d.ts'
import 'nax-ccuilib/src/headers/nax/input-field-type.d.ts'
import { InstallQueue } from '../install-queue'
import './list'

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

            onBackButtonPress(this: this): void
            updateInstallButton(this: this): void
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
        this.parent(new sc.ModMenuList(this))
        this.list.setPos(9, 23)

        this.inputField = new nax.ccuilib.InputField(232, 20)
        this.inputField.setPos(124, 2)
        this.inputField.onCharacterInput = () => {
            this.list.filters.name = this.inputField.getValueAsString()
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

        const hasIconCheckbox = new sc.CheckboxGui((this.list.filters.hasIcon = true))
        hasIconCheckbox.setPos(9, 300)
        hasIconCheckbox.onButtonPress = () => {
            this.list.filters.hasIcon = hasIconCheckbox.pressed
            this.list.reloadFilters()
        }
        this.addChildGui(hasIconCheckbox)
        sc.menu.buttonInteract.addGlobalButton(hasIconCheckbox, () => false)
        const hasIconText = new sc.TextGui('Has icon')
        hasIconText.setPos(35, 300)
        this.addChildGui(hasIconText)

        this.installButton = new sc.ButtonGui('', 128, true, sc.BUTTON_TYPE.SMALL)
        InstallQueue.changeListeners.push(() => this.updateInstallButton())
        this.updateInstallButton()
        this.installButton.setPos(432, 22)
        this.addChildGui(this.installButton)
        sc.menu.buttonInteract.addGlobalButton(this.installButton, () => false)
    },
    updateInstallButton() {
        const count = InstallQueue.values().length
        if (this.list.currentTabIndex >= 2) {
            this.installButton.doStateTransition('HIDDEN')
            return
        }
        this.installButton.doStateTransition('DEFAULT')
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
