import { ModListBox } from './mod-list-box.js'
import { ModDB } from './moddb.js'

export interface ModMenu extends sc.BaseMenu {
    modList: ModListBox
    database: ModDB

    onBackButtonPress(this: this): void
}
interface ModMenuConstructor extends ImpactClass<ModMenu> {
    new (): ModMenu
}

export const ModMenu: ModMenuConstructor = sc.BaseMenu.extend({
    init() {
        this.parent()
        this.hook.size.x = ig.system.width
        this.hook.size.y = ig.system.height

        this.database = new ModDB()

        this.modList = new ModListBox(this.database)
        this.addChildGui(this.modList)

        this.doStateTransition('DEFAULT', true)
    },
    showMenu() {
        this.addObservers()
        sc.menu.pushBackCallback(() => this.onBackButtonPress())
        sc.menu.moveLeaSprite(0, 0, sc.MENU_LEA_STATE.HIDDEN)
        this.modList.showMenu()
    },
    hideMenu() {
        this.removeObservers()
        sc.menu.moveLeaSprite(0, 0, sc.MENU_LEA_STATE.LARGE)
        this.exitMenu()
    },
    exitMenu() {
        this.modList.exitMenu()
    },
    onBackButtonPress() {
        sc.menu.popBackCallback()
        sc.menu.popMenu()
    },
})
