import { ModEntry } from '../types'
import { ModDB } from '../moddb'
import { Fliters, createFuzzyFilteredModList } from '../filters'
import { LocalMods } from '../local-mods'
import './list-entry'
import './repo-add'
import { InstallQueue } from '../mod-installer'
import { isGridLocalStorageId } from './filters'
import { Lang } from '../lang-manager'

declare global {
    namespace sc {
        interface ModMenuList extends sc.ListTabbedPane, sc.Model.Observer {
            filters: Fliters
            tabz: {
                name: string
                icon: string
                populateFunc: (list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER) => void
            }[]
            currentSort: sc.MOD_MENU_SORT_ORDER
            gridColumns: number
            isGrid: boolean

            updateColumnCount(this: this): void
            reloadFilters(this: this): void
            reloadEntries(this: this): void
            sortModEntries(this: this, mods: ModEntry[], sort: sc.MOD_MENU_SORT_ORDER): void
            populateOnline(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void
            populateSelected(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void
            populateEnabled(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void
            populateDisabled(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup, sort: sc.MOD_MENU_SORT_ORDER): void
            populateSettings(this: this, list: sc.ButtonListBox, buttonGroup: sc.ButtonGroup): void
            populateListFromMods(this: this, mods: ModEntry[], list: sc.ButtonListBox): void
        }
        interface ModMenuListConstructor extends ImpactClass<ModMenuList> {
            new (): ModMenuList
        }
        var ModMenuList: ModMenuListConstructor

        enum MOD_MENU_TAB_INDEXES {
            ONLINE,
            SELECTED,
            ENABLED,
            DISABLED,
            SETTINGS,
        }
    }
}

export const modMenuListWidth = 552
const modMenuListHeight = 240

sc.MOD_MENU_TAB_INDEXES = {
    ONLINE: 0,
    SELECTED: 1,
    ENABLED: 2,
    DISABLED: 3,
    SETTINGS: 4,
}

sc.ModMenuList = sc.ListTabbedPane.extend({
    transitions: {
        DEFAULT: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
        HIDDEN: { state: { alpha: 0, offsetX: 218 }, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
        HIDDEN_EASE: { state: { alpha: 0, offsetX: 218 }, time: 0.2, timeFunction: KEY_SPLINES.EASE },
    },
    /* extends */
    init() {
        this.parent(false)
        Object.defineProperty(this, 'isGrid', { get: () => localStorage.getItem(isGridLocalStorageId) == 'true' })
        this.gridColumns = 3

        this.tabz = [
            { name: Lang.onlineTab, populateFunc: this.populateOnline, icon: 'mod-icon-online' },
            { name: Lang.selectedModsTab, populateFunc: this.populateSelected, icon: 'mod-icon-selected' },
            { name: Lang.enabledTab, populateFunc: this.populateEnabled, icon: 'mod-icon-enabled' },
            { name: Lang.disabledTab, populateFunc: this.populateDisabled, icon: 'mod-icon-disabled' },
            { name: Lang.settingsTab, populateFunc: this.populateSettings, icon: 'stats-log' },
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

        ModDB.loadAllMods(() => {
            LocalMods.refreshOrigin().then(() => this.reloadEntries())
        }, true)
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
        this.addObservers!()
    },
    hide() {
        this.parent()
        this.doStateTransition('HIDDEN')
        this.removeObservers!()
    },
    onInitSortType() {
        return sc.MOD_MENU_SORT_ORDER.LAST_UPDATED
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
        return this.parent(index, settings)
    },
    onCreateListEntries(list, buttonGroup) {
        if (this.isGrid) {
            this.currentList.columns = this.gridColumns
            this.currentList.buttonGroup.selectionType = ig.BUTTON_GROUP_SELECT_TYPE.ALL

            /* apparently rfg cannot make a 3+ column pane display propely so here it is */
            this.currentList._getContentHeight = function (this: sc.ButtonListBox, _idontneedthis: boolean) {
                const elements = this.contentPane.hook.children
                const elementBelow = elements[elements.length - this.columns]
                if (elementBelow) return elementBelow.pos.y + elementBelow.size.y
                return this.paddingTop
            }
        }

        list.clear()
        buttonGroup.clear()
        this.tabz[this.currentTabIndex].populateFunc.bind(this)(list, buttonGroup, this.currentSort)
    },
    addObservers() {
        sc.Model.addObserver(sc.menu, this)
        sc.Model.addObserver(sc.modMenu, this)
    },
    removeObservers() {
        sc.Model.removeObserver(sc.menu, this)
        sc.Model.removeObserver(sc.modMenu, this)
    },
    modelChanged(model, message, data) {
        if (model == sc.menu) {
            if (message == sc.MENU_EVENT.SORT_LIST) {
                const sort = ((data as sc.ButtonGui).data as any).sortType as sc.MOD_MENU_SORT_ORDER
                this.currentSort = sort
                this.reloadEntries()
            }
        } else if (model == sc.modMenu) {
            if (message == sc.MOD_MENU_MESSAGES.REPOSITORY_CHANGED) {
                ModDB.loadAllMods(() => this.reloadEntries())
            } else if (message == sc.MOD_MENU_MESSAGES.UPDATE_ENTRIES) {
                this.reloadEntries()
            }
        }
    },
    setTab(index, ignorePrev, settings) {
        this.parent(index, ignorePrev, settings)
        sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.TAB_CHANGED)
    },
    /* new stuff */
    populateSettings() {},
    sortModEntries(mods, sort) {
        if (!this.filters.name) {
            function gm(m: ModEntry) {
                return m.isLocal && m.serverCounterpart ? m.serverCounterpart : m
            }
            if (sort == sc.MOD_MENU_SORT_ORDER.NAME) {
                mods.sort((a, b) => a.name.localeCompare(b.name))
            } else if (sort == sc.MOD_MENU_SORT_ORDER.STARS) {
                mods.sort((a, b) => a.name.localeCompare(b.name))
                mods.sort((a, b) => (gm(b).stars ?? -100) - (gm(a).stars ?? -100))
            } else if (sort == sc.MOD_MENU_SORT_ORDER.LAST_UPDATED) {
                mods.sort((a, b) => a.name.localeCompare(b.name))
                mods.sort((a1, b1) => {
                    const a = gm(a1)
                    const b = gm(b1)
                    const ta = ('lastUpdateTimestamp' in a && a.lastUpdateTimestamp) || -100
                    const tb = ('lastUpdateTimestamp' in b && b.lastUpdateTimestamp) || -100
                    return tb - ta
                })
            }
        }
    },
    populateOnline(list, _, sort: sc.MOD_MENU_SORT_ORDER) {
        let mods = Object.values(ModDB.removeModDuplicates(ModDB.modRecord))
        mods = createFuzzyFilteredModList(this.filters, mods)
        this.sortModEntries(mods, sort)
        this.populateListFromMods(mods, list)
    },
    populateSelected(list, _, sort: sc.MOD_MENU_SORT_ORDER) {
        const mods = createFuzzyFilteredModList(this.filters, InstallQueue.values())
        this.sortModEntries(mods, sort)
        this.populateListFromMods(mods, list)
    },
    populateEnabled(list, _, sort: sc.MOD_MENU_SORT_ORDER) {
        const mods = createFuzzyFilteredModList(this.filters, LocalMods.getActive())
        this.sortModEntries(mods, sort)
        this.populateListFromMods(mods, list)
    },
    populateDisabled(list, _, sort: sc.MOD_MENU_SORT_ORDER) {
        const mods = createFuzzyFilteredModList(this.filters, LocalMods.getInactive())
        this.sortModEntries(mods, sort)
        this.populateListFromMods(mods, list)
    },
    populateListFromMods(mods, list) {
        const totalWidth = this.hook.size.x
        for (let i = 0; i < mods.length; i++) {
            const mod = mods[i]
            const newModEntry = new sc.ModListEntry(mod, this)
            const x = this.isGrid ? (i % this.gridColumns) * (totalWidth / this.gridColumns - 1) : 0
            list.addButton(newModEntry, undefined, x)
        }
    },
    reloadFilters() {
        this.reloadEntries()
    },
    reloadEntries() {
        this.setTab(this.currentTabIndex, true, { skipSounds: true })
    },
    updateColumnCount() {
        if (this.isGrid) {
            this.currentList.columns = this.gridColumns
            this.currentList.buttonGroup.selectionType = ig.BUTTON_GROUP_SELECT_TYPE.ALL
        } else {
            this.currentList.columns = 1
            this.currentList.buttonGroup.selectionType = ig.BUTTON_GROUP_SELECT_TYPE.HORIZONTAL
        }
    },
})
