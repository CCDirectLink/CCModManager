import { ModListEntry } from '../types.js'
import { ModListBoxEntry } from './mod-list-box-entry.js'
import { ModDB } from './moddb.js'

export interface ModListBox extends ig.GuiElementBase, sc.Model.Observer {
    gfx: ig.Image
    mods: ModListEntry[]
    modEntries: unknown[]
    buttonGroup: sc.ButtonGroup
    keyBinder: sc.KeyBinderGui
    bg: sc.MenuScanLines
    entrySize: number
    list: sc.ButtonListBox
    listContent: unknown
    database: ModDB

    _createList(this: this): void
    showMenu(this: this): void
    exitMenu(this: this): void
}
interface ModListBoxConstructor extends ImpactClass<ModListBox> {
    new (database: ModDB): ModListBox
}

export const ModListBox: ModListBoxConstructor = ig.GuiElementBase.extend({
    gfx: new ig.Image('media/gui/menu.png'),
    mods: [],
    modEntries: [],
    entrySize: 0,

    init(database) {
        this.parent()

        this.database = database

        this.setSize(436, 258)
        this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER)

        this.hook.transitions = {
            DEFAULT: {
                state: {},
                time: 0.2,
                timeFunction: window.KEY_SPLINES.LINEAR,
            },
            HIDDEN: {
                state: {
                    alpha: 0,
                    offsetX: 218,
                },
                time: 0.2,
                timeFunction: window.KEY_SPLINES.LINEAR,
            },
        }

        const menuPanel = new sc.MenuPanel()
        menuPanel.setSize(436, 258)
        this.addChildGui(menuPanel)

        this.bg = new sc.MenuScanLines()
        this.bg.setSize(436, 258)
        this.addChildGui(this.bg)

        const buttonSquareSize = 14
        this.entrySize = buttonSquareSize * 3 + 1

        this.list = new sc.ButtonListBox(1, 0, this.entrySize)
        this.list.setSize(436, 258)
        this.buttonGroup = this.list.buttonGroup
        this.addChildGui(this.list)

        this.database
            .getMods()
            .then(mods => {
                this.mods = mods
                this._createList()
            })
            .catch(err => sc.Dialogs.showErrorDialog(err.message))

        this.doStateTransition('HIDDEN', true)
    },

    _createList() {
        this.mods.forEach(mod => {
            const newModEntry = new ModListBoxEntry(this.database, mod.id, mod.name, mod.description ?? '', mod.versionString, null, this)
            this.modEntries.push(newModEntry)
            this.list.addButton(newModEntry, false)
        })
    },
    showMenu() {
        sc.menu.buttonInteract.pushButtonGroup(this.buttonGroup)
        this.keyBinder = new sc.KeyBinderGui()
        ig.gui.addGuiElement(this.keyBinder)
        sc.keyBinderGui = this.keyBinder
        this.list.activate()
        this.doStateTransition('DEFAULT')
    },
    exitMenu() {
        sc.menu.buttonInteract.removeButtonGroup(this.buttonGroup)
        this.keyBinder.remove()
        sc.keyBinderGui = null
        this.list.deactivate()
        this.doStateTransition('HIDDEN')
    },
})
