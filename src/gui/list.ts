import { ModEntry } from '../types'
import { ModListEntry } from './list-entry'
import { databases } from '../moddb'
import { Fliters, createFuzzyFilteredModList } from '../filters'
import { SORT_ORDER } from './menu'

export interface ModMenuList extends sc.ListTabbedPane, sc.Model.Observer {
    mods: Record<string, ModEntry[]>
    filters: Fliters
    tabz: { name: string; icon: string; populateFunc: (list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: SORT_ORDER) => void }[]
    currentSort: SORT_ORDER

    setMods(this: this, mods: ModEntry[], dbName: string): void
    reloadFilters(this: this): void
    reloadEntries(this: this): void
    sortModEntries(this: this, mods: ModEntry[], sort: SORT_ORDER): void
    populateStore(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: SORT_ORDER): void
    populateSettings(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup): void
}
interface ModMenuListConstructor extends ImpactClass<ModMenuList> {
    new (): ModMenuList
}

export const modMenuListWidth = 552
const modMenuListHeight = 240
export const ModMenuList: ModMenuListConstructor = sc.ListTabbedPane.extend({
    mods: {},
    transitions: {
        DEFAULT: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
        HIDDEN: { state: { alpha: 0, offsetX: 218 }, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
        HIDDEN_EASE: { state: { alpha: 0, offsetX: 218 }, time: 0.2, timeFunction: KEY_SPLINES.EASE },
    },
    init() {
        this.parent(false)

        this.tabz = [
            { name: 'Store', populateFunc: this.populateStore, icon: 'quest-all' },
            { name: 'Settings', populateFunc: this.populateSettings, icon: 'quest' },
        ]
        this.filters = {}
        this.currentSort = this.onInitSortType()

        this.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP)
        this.setSize(modMenuListWidth, modMenuListHeight)
        this.setPanelSize(modMenuListWidth, modMenuListHeight - 19)
        this.setPivot(modMenuListWidth, modMenuListHeight)

        for (let i = 0; i < this.tabz.length; i++) {
            this.addTab(this.tabz[i].name, i, {})
        }

        for (const dbName in databases) {
            const db = databases[dbName]
            if (db.active) {
                this.mods[dbName] = []
                db.getMods(dbName, mods => this.setMods(mods, dbName))
            }
        }
    },
    setMods(mods, dbName) {
        this.mods[dbName] = mods
        this.reloadEntries()
    },
    show() {
        this.parent()

        this.setTab(0, true, { skipSounds: true })
        const firstTabButton = this.tabGroup.elements[0][0] as unknown as sc.ItemTabbedBox.TabButton
        firstTabButton.setPressed(true)
        this._prevPressed = firstTabButton
        this.resetButtons(firstTabButton)
        this.rearrangeTabs()

        ig.interact.setBlockDelay(0.2)
        this.doStateTransition('DEFAULT')
    },
    hide() {
        this.parent()
        this.doStateTransition('HIDDEN')
    },
    reloadFilters() {
        this.reloadEntries()
    },
    reloadEntries() {
        this.setTab(this.currentTabIndex, true, { skipSounds: true })
    },
    onInitSortType() {
        return SORT_ORDER.STARS
    },
    onTabButtonCreation(key: string, _index: number, settings) {
        const icon = this.tabz.find(tab => tab.name == key)!.icon
        const button = new sc.ItemTabbedBox.TabButton(key, icon, 85)
        button.textChild.setPos(7, 1)
        button.setPos(0, 2)
        button.setData({ type: settings.type })
        this.addChildGui(button)
        return button
    },
    onTabPressed(_button, wasSame) {
        if (!wasSame) {
            sc.BUTTON_SOUND.submit.play()
            return true
        }
    },
    onLeftRightPress() {
        sc.BUTTON_SOUND.submit.play()
        return { skipSounds: true }
    },
    onContentCreation(index, settings) {
        this.currentList && this.currentList.clear()
        this.currentGroup && this.currentGroup.clear()
        this.parent(index, settings)
    },
    populateSettings(list) {
        const repositoriesButton = new sc.ButtonGui('Repositories')
        repositoriesButton.onButtonPress = () => {
            console.log('press')
        }
        list.addButton(repositoriesButton)
    },
    sortModEntries(mods, sort) {
        if (!this.filters.name) {
            if (sort == SORT_ORDER.NAME) {
                mods.sort((a, b) => a.name.localeCompare(b.name))
            } else if (sort == SORT_ORDER.NAME_REVERSE) {
                mods.sort((a, b) => a.name.localeCompare(b.name) * -1)
            } else if (sort == SORT_ORDER.STARS) {
                mods.sort((a, b) => (b.stars ?? -100) - (a.stars ?? -100))
            }
        }
    },
    populateStore(list, _, sort: SORT_ORDER) {
        const mods = createFuzzyFilteredModList(
            this.filters,
            Object.values(this.mods).reduce((acc, v) => {
                acc.push(...v)
                return acc
            }, [])
        )
        this.sortModEntries(mods, sort)
        for (const mod of mods) {
            const newModEntry = new ModListEntry(mod, this)
            list.addButton(newModEntry)
        }
    },
    onCreateListEntries(list, buttonGroup) {
        list.clear()
        buttonGroup.clear()
        this.tabz[this.currentTabIndex].populateFunc.bind(this)(list, buttonGroup, this.currentSort)
    },
    onListEntryPressed(_button) {
        sc.BUTTON_SOUND.submit.play()
    },
    addObservers() {
        sc.Model.addObserver(sc.menu, this)
    },
    removeObservers() {
        sc.Model.removeObserver(sc.menu, this)
    },
    modelChanged(model, message, data) {
        if (model == sc.menu && message == sc.MENU_EVENT.SORT_LIST) {
            const sort = ((data as sc.ButtonGui).data as any).sortType as SORT_ORDER
            this.currentSort = sort
            this.reloadEntries()
        }
    },
})
