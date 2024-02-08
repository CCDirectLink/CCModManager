import { ModEntry } from '../types'
import { databases } from '../moddb'
import { Fliters, createFuzzyFilteredModList } from '../filters'
import { InstallQueue } from '../install-queue'
import './list-entry'
import { InstalledMods } from '../installed-mod-manager'

declare global {
    namespace sc {
        interface ModMenuList extends sc.ListTabbedPane, sc.Model.Observer {
            modMenu: sc.ModMenu
            mods: Record<string, ModEntry[]>
            filters: Fliters
            tabz: {
                name: string
                icon: string
                populateFunc: (list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER) => void
            }[]
            currentSort: sc.MOD_MENU_SORT_ORDER

            setMods(this: this, mods: ModEntry[], dbName: string): void
            reloadFilters(this: this): void
            reloadEntries(this: this): void
            sortModEntries(this: this, mods: ModEntry[], sort: sc.MOD_MENU_SORT_ORDER): void
            populateOnline(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void
            populateSelected(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void
            populateEnabled(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void
            populateDisabled(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void
            populateSettings(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup): void
        }
        interface ModMenuListConstructor extends ImpactClass<ModMenuList> {
            new (modMenu: sc.ModMenu): ModMenuList
        }
        var ModMenuList: ModMenuListConstructor
    }
}

export const modMenuListWidth = 552
const modMenuListHeight = 240

export enum MOD_MENU_TAB_INDEXES {
    ONLINE = 0,
    SELECTED = 1,
    ENABLED = 2,
    DISABLED = 3,
    SETTINGS = 4,
}

sc.ModMenuList = sc.ListTabbedPane.extend({
    mods: {},
    transitions: {
        DEFAULT: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
        HIDDEN: { state: { alpha: 0, offsetX: 218 }, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
        HIDDEN_EASE: { state: { alpha: 0, offsetX: 218 }, time: 0.2, timeFunction: KEY_SPLINES.EASE },
    },
    /* extends */
    init(modMenu) {
        this.parent(false)
        this.modMenu = modMenu

        this.tabz = [
            { name: ig.lang.get('sc.gui.menu.ccmodloader.onlineTab'), populateFunc: this.populateOnline, icon: 'quest-all' },
            { name: ig.lang.get('sc.gui.menu.ccmodloader.selectedModsTab'), populateFunc: this.populateSelected, icon: 'quest-fav' },
            { name: ig.lang.get('sc.gui.menu.ccmodloader.enabledTab'), populateFunc: this.populateEnabled, icon: 'quest-solve' },
            { name: ig.lang.get('sc.gui.menu.ccmodloader.disabledTab'), populateFunc: this.populateDisabled, icon: 'quest-elite' },
            { name: ig.lang.get('sc.gui.menu.ccmodloader.settingsTab'), populateFunc: this.populateSettings, icon: 'stats-log' },
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
    onInitSortType() {
        return sc.MOD_MENU_SORT_ORDER.STARS
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
            const sort = ((data as sc.ButtonGui).data as any).sortType as sc.MOD_MENU_SORT_ORDER
            this.currentSort = sort
            this.reloadEntries()
        }
    },
    setTab(index, ignorePrev, settings) {
        this.parent(index, ignorePrev, settings)
        this.modMenu.updateInstallButton()
    },
    /* new stuff */
    populateSettings(list) {
        const repositoriesButton = new sc.ButtonGui('Repositories')
        repositoriesButton.onButtonPress = () => {
            console.log('press')
        }
        list.addButton(repositoriesButton)
    },
    sortModEntries(mods, sort) {
        if (!this.filters.name) {
            if (sort == sc.MOD_MENU_SORT_ORDER.NAME) {
                mods.sort((a, b) => a.name.localeCompare(b.name))
            } else if (sort == sc.MOD_MENU_SORT_ORDER.NAME_REVERSE) {
                mods.sort((a, b) => a.name.localeCompare(b.name) * -1)
            } else if (sort == sc.MOD_MENU_SORT_ORDER.STARS) {
                mods.sort((a, b) => a.name.localeCompare(b.name))
                mods.sort((a, b) => (b.stars ?? -100) - (a.stars ?? -100))
            }
        }
    },
    populateOnline(list, _, sort: sc.MOD_MENU_SORT_ORDER) {
        const mods = createFuzzyFilteredModList(
            this.filters,
            Object.values(this.mods).reduce((acc, v) => {
                acc.push(...v)
                return acc
            }, [])
        )
        this.sortModEntries(mods, sort)
        for (const mod of mods) {
            const newModEntry = new sc.ModListEntry(mod, this)
            list.addButton(newModEntry)
        }
    },
    populateSelected(list, _, sort: sc.MOD_MENU_SORT_ORDER) {
        const mods = createFuzzyFilteredModList(this.filters, InstallQueue.values())
        this.sortModEntries(mods, sort)
        for (const mod of mods) {
            const newModEntry = new sc.ModListEntry(mod, this)
            list.addButton(newModEntry)
        }
    },
    populateEnabled(list, _, sort: sc.MOD_MENU_SORT_ORDER) {
        const mods = createFuzzyFilteredModList(this.filters, InstalledMods.getActive())
        this.sortModEntries(mods, sort)
        for (const mod of mods) {
            const newModEntry = new sc.ModListEntry(mod, this)
            list.addButton(newModEntry)
        }
    },
    populateDisabled(list, _, sort: sc.MOD_MENU_SORT_ORDER) {
        const mods = createFuzzyFilteredModList(this.filters, InstalledMods.getInactive())
        this.sortModEntries(mods, sort)
        for (const mod of mods) {
            const newModEntry = new sc.ModListEntry(mod, this)
            list.addButton(newModEntry)
        }
    },
    reloadFilters() {
        this.reloadEntries()
    },
    reloadEntries() {
        this.setTab(this.currentTabIndex, true, { skipSounds: true })
    },
    setMods(mods, dbName) {
        this.mods[dbName] = mods
        this.reloadEntries()
    },
})
