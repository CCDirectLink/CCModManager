import { Fliters } from '../filters'
import { Lang } from '../lang-manager'

declare global {
    namespace sc {
        interface FiltersPopup extends ig.GuiElementBase {
            gfx: ig.Image
            buttonGroup: sc.ButtonGroup
            backButton: sc.ButtonGui
            checkboxesGuis: { text: sc.TextGui; checkbox: sc.FilterCheckox }[]
            infoBar: sc.InfoBar

            getLangData(this: this, key: keyof typeof Lang.filters): { name: string; description: string }
            setFilterValue(this: this, config: CheckboxConfig, state: boolean): void
            getFilterValue(this: this, config: CheckboxConfig): boolean | undefined
            show(this: this): void
            hide(this: this): void
        }
        interface FiltersPopupConstructor extends ImpactClass<FiltersPopup> {
            new (): FiltersPopup
        }
        var FiltersPopup: FiltersPopupConstructor

        interface FilterCheckox extends sc.CheckboxGui {}
        interface FilterCheckoxConstructor extends ImpactClass<FilterCheckox> {
            new (): FilterCheckox
        }
        var ModMenuFilterCheckboxGui: FilterCheckoxConstructor
    }
}

export const isGridLocalStorageId = 'CCModManager-grid'
type CheckboxConfig = { key: keyof typeof Lang.filters; default?: boolean } & ({ filterKey?: keyof Fliters } | { localStorageKey: string; callback: () => void })

const checkboxes: CheckboxConfig[] = [
    {
        key: 'gridView',
        localStorageKey: isGridLocalStorageId,
        default: false,
        callback: () => sc.modMenu.list.updateColumnCount(),
    },
    { key: 'local', filterKey: 'includeLocal', default: true },
    { key: 'hideLibrary', filterKey: 'hideLibraryMods', default: true },
    { key: 'tagQol' },
    { key: 'tagPlayerCharacter' },
    { key: 'tagPartyMember' },
    { key: 'tagCombatArts' },
    { key: 'tagPvpDuel' },
    { key: 'tagArena' },
    { key: 'tagDungeon' },
    { key: 'tagQuests' },
    { key: 'tagMaps' },
    { key: 'tagBoss' },
    { key: 'tagPuzzle' },
    { key: 'tagNg+' },
    { key: 'tagCosmetic' },
    { key: 'tagFun' },
    { key: 'tagCheats' },
    { key: 'tagSpeedrun' },
    { key: 'tagWidget' },
    { key: 'tagLanguage' },
    { key: 'tagAccessibility' },
    { key: 'tagDev' },
    { key: 'tagLibrary' },
]

sc.ModMenuFilterCheckboxGui = sc.CheckboxGui.extend({
    init() {
        this.parent(false)
    },
    focusGained() {
        this.parent()
        sc.modMenu.filtersPopup.infoBar.setText(this.data as string)
        sc.modMenu.filtersPopup.infoBar.doStateTransition('DEFAULT')
    },
    focusLost() {
        this.parent()
        sc.modMenu.filtersPopup.infoBar.doStateTransition('HIDDEN')
    },
})

sc.FiltersPopup = ig.GuiElementBase.extend({
    gfx: new ig.Image('media/gui/menu.png'),
    transitions: {
        DEFAULT: { state: { alpha: 1 }, time: 0.2, timeFunction: KEY_SPLINES.EASE_OUT },
        HIDDEN: { state: { alpha: 0 }, time: 0.3, timeFunction: KEY_SPLINES.EASE_IN },
    },
    getLangData(key) {
        return Lang.filters[key]
    },
    setFilterValue(config, state) {
        const filters = sc.modMenu.list.filters
        if ('filterKey' in config && config.filterKey) {
            filters[config.filterKey] = state as any
        } else if ('localStorageKey' in config) {
            localStorage.setItem(config.localStorageKey, state.toString())
            config.callback()
        } else {
            filters.tags ??= []
            const name = this.getLangData(config.key).name
            if (state) filters.tags.push(name)
            else filters.tags.erase(name)
        }
        sc.modMenu.list.reloadFilters()
        /* hack to get the popup button group on top again, because the main mod menu button group got pushed on top when sc.modMenu.list.reloadFilters() is called */
        const arr: sc.ButtonGroup[] = sc.menu.buttonInteract.buttonGroupStack
        const last: number = arr.length
        ;[arr[last - 2], arr[last - 1]] = [arr[last - 1], arr[last - 2]]
    },
    getFilterValue(config) {
        const filters = sc.modMenu.list.filters
        if ('filterKey' in config && config.filterKey) {
            return filters[config.filterKey] as boolean | undefined
        } else if ('localStorageKey' in config) {
            const item = localStorage.getItem(config.localStorageKey)
            if (item === null) return !!config.default
            return item == 'true'
        } else return filters.tags?.includes(this.getLangData(config.key).name)
    },
    init() {
        this.parent()
        this.hook.zIndex = 9999999
        this.hook.localAlpha = 0.8
        this.hook.temporary = true
        this.hook.pauseGui = true
        this.hook.size.x = ig.system.width
        this.hook.size.y = ig.system.height

        this.infoBar = new sc.InfoBar()
        this.infoBar.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_BOTTOM)
        this.infoBar.hook.zIndex = 1e100
        this.infoBar.doStateTransition('HIDDEN')
        this.addChildGui(this.infoBar)

        this.buttonGroup = new sc.ButtonGroup()

        const box = new ig.GuiElementBase()

        const offset: Vec2 = { x: 0, y: 5 }
        this.checkboxesGuis = []
        const tagsW = 3
        const spacingW = 10
        const spacingH = 3
        const maxY = Math.ceil(checkboxes.length / tagsW)
        const textW: number = 140
        const textH = 20
        for (let i = 0; i < checkboxes.length; i++) {
            const config = checkboxes[i]
            const lang = this.getLangData(config.key)

            const x = i % tagsW
            const y = (i / tagsW).floor()
            const checkbox = new sc.ModMenuFilterCheckboxGui()
            checkbox.setPos(x * (textW + spacingW) + offset.x, y * (textH + spacingH))
            checkbox.data = lang.description
            if (config.default !== undefined && !('localStorageKey' in config)) {
                checkbox.setPressed(config.default)
                this.setFilterValue(config, config.default)
            }
            checkbox.onButtonPress = () => {
                this.setFilterValue(config, checkbox.pressed)
            }
            const text = new sc.TextGui(lang.name)
            text.setPos(checkbox.hook.pos.x + checkbox.hook.size.x + spacingW, checkbox.hook.pos.y)
            text.setSize(textW, textH)
            this.checkboxesGuis.push({ text, checkbox })
            this.buttonGroup.addFocusGui(checkbox, x, y)

            box.addChildGui(text)
            box.addChildGui(checkbox)
        }
        box.setSize(tagsW * textW + spacingW * 2 + offset.x, maxY * (textH + spacingH) + offset.y)

        this.backButton = new sc.ButtonGui('\\i[back]' + ig.lang.get('sc.gui.menu.back'), undefined, true, sc.BUTTON_TYPE.SMALL)
        this.backButton.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP)
        this.backButton.setPos(0, 0)
        this.backButton.submitSound = sc.BUTTON_SOUND.back
        this.backButton.onButtonPress = () => {
            this.hide()
        }
        this.addChildGui(this.backButton)

        const center = new sc.CenterBoxGui(box)
        center.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER)
        this.addChildGui(center)

        this.doStateTransition('HIDDEN')
    },
    updateDrawables(renderer) {
        renderer.addColor('#000', 0, 0, this.hook.size.x, this.hook.size.y)
    },
    show() {
        ig.gui.addGuiElement(this)
        this.doStateTransition('DEFAULT')
        ig.interact.setBlockDelay(0.2)

        sc.menu.buttonInteract.pushButtonGroup(this.buttonGroup)
        sc.menu.pushBackCallback(() => {
            this.backButton.onButtonPress()
        })

        for (let i = 0; i < this.checkboxesGuis.length; i++) {
            const guis = this.checkboxesGuis[i]
            const state = this.getFilterValue(checkboxes[i])
            if (typeof state === 'boolean') guis.checkbox.setPressed(state)
        }
    },
    hide() {
        this.doStateTransition('HIDDEN', undefined, true)
        this.infoBar.doStateTransition('HIDDEN')
        sc.menu.buttonInteract.removeButtonGroup(this.buttonGroup)
        sc.menu.buttonInteract.removeGlobalButton(this.backButton)
        ig.interact.setBlockDelay(0.2)
        sc.menu.popBackCallback()
    },
})
