import type { ModSettingsGui } from '../../mod-options'
import { ModEntry } from '../../types'

export {}
declare global {
    namespace modmanager.gui {
        namespace OptionsTabBox {
            type GuiOption =
                | sc.OptionInfoBox
                | modmanager.gui.OptionsOptionRow
                | modmanager.gui.OptionsOptionButton
                | modmanager.gui.OptionsOptionInputField
        }
        interface OptionsTabBox extends ig.GuiElementBase, sc.Model.Observer {
            gfx: ig.Image

            mod: ModEntry
            conf: ModSettingsGui
            opts: Record<string, any>

            currentTab: number
            lastButtonData: modmanager.gui.OptionsTabBox.TabButton['data']
            prevIndex: number
            tabs: Record<string, modmanager.gui.OptionsTabBox.TabButton>
            tabArray: modmanager.gui.OptionsTabBox.TabButton[]
            tabGroup: sc.ButtonGroup
            rows: modmanager.gui.OptionsTabBox.GuiOption[]
            rowButtonGroup: sc.RowButtonGroup
            tabContent: {
                buttonGroup: Nullable<modmanager.gui.OptionsTabBox['rowButtonGroup']>
                list: Nullable<modmanager.gui.OptionsTabBox['list']>
                rows: Nullable<modmanager.gui.OptionsTabBox['rows']>
            }[]
            list: sc.ButtonListBox
            prevPressed: modmanager.gui.OptionsTabBox.TabButton
            menuScanLines: sc.MenuScanLines
            keyBinder: sc.KeyBinderGui

            initTabGroup(this: this): void
            initMenuPanel(this: this): void
            initMenuScanLines(this: this): void
            initBackgroundTexture(this: this): void
            initBackgroundColor(this: this): void

            updateEntries(this: this, mod: ModEntry): void
            createTabs(this: this): void

            showMenu(this: this): void
            hideMenu(this: this): void
            _createOptionList(this: this, category: string): void
            _rearrangeTabs(this: this): void
            _createCacheList(this: this, category: string, bool1?: boolean, bool2?: boolean): void
            _createTabButton(
                this: this,
                title: string,
                x: number,
                categoryId: string,
                icon?: string
            ): modmanager.gui.OptionsTabBox.TabButton

            onButtonTraversal(this: this): void
            _resetButtons(this: this, tabButton?: modmanager.gui.OptionsTabBox.TabButton, unfocus?: boolean): void
            setCurrentTab(this: this, tabIndex: number, noSound?: boolean): void

            addObservers(this: this): void
            removeObservers(this: this): void
        }
        interface OptionsTabBoxConstructor extends ImpactClass<OptionsTabBox> {
            TabButton: modmanager.gui.OptionsTabBox.TabButtonConstructor
            new (): OptionsTabBox
        }
        var OptionsTabBox: OptionsTabBoxConstructor
    }
}

modmanager.gui.OptionsTabBox = ig.GuiElementBase.extend({
    gfx: new ig.Image('media/gui/menu.png'),

    init() {
        this.parent()
        this.setSize(436, 258)
        this.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER)
        this.hook.transitions = {
            DEFAULT: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
            HIDDEN: { state: { alpha: 0, offsetX: 218 }, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
        }

        this.initTabGroup()
        this.initMenuPanel()
        this.initMenuScanLines()
        this.initBackgroundTexture()
        this.initBackgroundColor()

        this.prevIndex = -1

        this.doStateTransition('HIDDEN', true)
    },
    initTabGroup() {
        this.tabGroup = new sc.ButtonGroup()

        this.tabGroup.addPressCallback(_button => {
            const button = _button as modmanager.gui.OptionsTabBox.TabButton
            const tabIndex = this.tabArray.indexOf(button)
            this.setCurrentTab(tabIndex)
        })
    },
    initMenuPanel() {
        const menuPanel = new sc.MenuPanel()
        menuPanel.setSize(436, 242)
        menuPanel.setPos(0, 21)
        this.addChildGui(menuPanel)
    },
    initMenuScanLines() {
        this.menuScanLines = new sc.MenuScanLines()
        this.menuScanLines.setPos(0, 29)
        this.menuScanLines.setSize(436, 228)
        this.addChildGui(this.menuScanLines)
    },
    initBackgroundTexture() {
        const img = new ig.ImageGui(this.gfx, 32, 408, 5, 5)
        img.setPos(0, 21)
        this.addChildGui(img)
    },
    initBackgroundColor() {
        const color = new ig.ColorGui('#FF6D00', 431, 1)
        color.setPos(5, 21)
        this.addChildGui(color)
    },

    updateEntries(mod) {
        this.mod = mod
        this.conf = modmanager.optionConfigs[mod.id]
        this.opts = modmanager.options[mod.id]

        this.createTabs()
    },
    createTabs() {
        this.prevIndex = -1
        this.tabs = {}

        if (this.tabArray) {
            this._resetButtons(undefined, true)
            for (const tab of this.tabArray) {
                this.removeChildGui(tab)
            }
        }
        this.tabArray = []
        this.tabGroup?.clear()
        this.rows = []
        this.tabContent = []
        this.list?.clear()

        let tabIndex = 0
        for (const category in this.conf.structure) {
            const categorySettings = this.conf.structure[category].settings
            this.tabs[category] = this._createTabButton(
                categorySettings.title,
                tabIndex++,
                category,
                categorySettings.tabIcon
            )
        }
        this.currentTab = 0
        this.tabGroup.setCurrentFocus(0, 0)
        const firstTab = this.tabArray[0]
        if (firstTab) {
            firstTab.setPressed(true)
            this.prevPressed = firstTab
        }
        this._rearrangeTabs()

        this.lastButtonData = this.tabArray[0].data
        this._createCacheList(this.lastButtonData.type, ig.input.mouseGuiActive, true)
    },
    _createTabButton(title, x, categoryId, icon) {
        const tabWidth = Math.max(90, sc.fontsystem.font.getTextDimensions(title).x + 35)
        const tabButton = new modmanager.gui.OptionsTabBox.TabButton(title, icon, tabWidth)
        tabButton.textChild.setPos(7, 1)
        tabButton.setPos(0, 2)
        tabButton.data = { type: categoryId }
        this.addChildGui(tabButton)
        this.tabGroup.addFocusGui(tabButton, x, 0)
        return (this.tabArray[x] = tabButton)
    },

    _createCacheList(category: string, bool1?: boolean, bool2?: boolean) {
        bool1 = bool1 || false
        bool2 = bool2 || false
        if (this.tabContent[this.prevIndex]) {
            this.list.deactivate()
            this.list.doStateTransition('HIDDEN', true)
        }
        const currentTabIndex = this.currentTab
        let tabContent = this.tabContent[currentTabIndex]
        if (tabContent) {
            this.list = tabContent.list!
            this.rows = tabContent.rows!
            this.rowButtonGroup = tabContent.buttonGroup!
            this.list.activate()
            this.list.doStateTransition('DEFAULT', true)
            !bool1 && this.rowButtonGroup.regainCurrentFocus(false, bool2)
        } else {
            tabContent = { buttonGroup: null, list: null, rows: null }
            this.rowButtonGroup = new sc.RowButtonGroup()
            this.rowButtonGroup.enableMultiPressed = true
            this.rowButtonGroup.soundsOnPressed = true
            this.list = new sc.ButtonListBox(1, 1, 28)
            this.list.setPos(0, 29)
            this.list.setSize(436, 228)
            this.list.setButtonGroup(this.rowButtonGroup)
            this.list.hook.transitions = {
                DEFAULT: { state: {}, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
                HIDDEN: { state: { alpha: 0 }, time: 0.2, timeFunction: KEY_SPLINES.LINEAR },
            }
            this.addChildGui(this.list)
            this.rowButtonGroup.isNonMouseMenuInput = () =>
                sc.control.menuConfirm() ||
                sc.control.rightDown() ||
                sc.control.leftDown() ||
                sc.control.downDown() ||
                sc.control.upDown() ||
                sc.control.menuCircleLeft() ||
                sc.control.menuCircleRight()

            this.rowButtonGroup.addSelectionCallback(_button => {
                const button = _button as { data?: { description: string } }
                button.data && sc.menu.setInfoText(button.data.description ? button.data.description : button.data)
            })
            this.rowButtonGroup.setLeftRightCallback((stepRight, rowIndex) => {
                const row = this.rows[rowIndex] as modmanager.gui.OptionsOptionRow
                if (!row) return false
                return row.onLeftRight(stepRight)
            })
            this.rowButtonGroup.addPressCallback(_button => {
                const button = _button as ig.FocusGui & { data?: { row: number } }
                if (button.data?.row != undefined) {
                    const row = this.rows[button.data.row] as modmanager.gui.OptionsOptionRow
                    row.onPressed(button)
                }
            })
            this.rowButtonGroup.onButtonTraversal = this.onButtonTraversal.bind(this)
            this._createOptionList(category)
            tabContent.buttonGroup = this.rowButtonGroup
            tabContent.list = this.list
            tabContent.rows = this.rows
            this.list.activate()
            this.tabContent[currentTabIndex] = tabContent
            this.prevIndex = currentTabIndex
        }
    },
    _createOptionList(category: string) {
        this.rows = []
        const headers = this.conf.structure[category].headers

        let optionI = 0
        for (const header in headers) {
            const options = headers[header]
            for (const optionId in options) {
                const option = options[optionId]

                if (option.type == 'JSON_DATA') continue

                if (option.hidden && (typeof option.hidden === 'boolean' || option.hidden())) {
                    continue
                }

                let optionGui: modmanager.gui.OptionsTabBox.GuiOption

                if (option.type == 'INFO') {
                    optionGui = new modmanager.gui.OptionsOptionInfoBox(option, 431)
                } else if (option.type == 'BUTTON') {
                    optionGui = new modmanager.gui.OptionsOptionButton(option, optionI, this.rowButtonGroup, 431)
                } else if (option.type == 'INPUT_FIELD') {
                    optionGui = new modmanager.gui.OptionsOptionInputField(option, optionI, this.rowButtonGroup, 431)
                } else {
                    optionGui = new modmanager.gui.OptionsOptionRow(option, optionI, this.rowButtonGroup, 431)
                }
                this.rows[optionI] = optionGui
                optionI++

                this.list.addButton(optionGui, true)
            }
        }
    },

    _rearrangeTabs() {
        let x = 0
        for (let i = 0; i < this.tabArray.length; i++) {
            const tab = this.tabArray[i]
            tab.hook.pos.x = x
            x = x + tab.hook.size.x
        }
    },

    onButtonTraversal() {
        let tabIndex = this.currentTab
        let tab = this.tabArray[tabIndex]
        let moveAmount = -1
        if (sc.control.menuCircleRight()) {
            moveAmount = 1
        } else if (sc.control.menuCircleLeft()) {
            moveAmount = 0
        }
        if (moveAmount >= 0) {
            sc.BUTTON_SOUND.submit.play()
            tab.setPressed(false)
            if (moveAmount == 1) {
                tabIndex++
                tabIndex >= this.tabArray.length && (tabIndex = 0)
            } else {
                tabIndex--
                tabIndex < 0 && (tabIndex = this.tabArray.length - 1)
            }
            this.prevPressed = tab = this.tabArray[tabIndex]
            tab.setPressed(true)
            this._resetButtons(tab, true)
            this._rearrangeTabs()
            this.lastButtonData = tab.data

            this.currentTab = tabIndex
            sc.Model.notifyObserver(sc.menu, sc.MENU_EVENT.OPTION_CHANGED_TAB)
        }
    },
    _resetButtons(tabButton, unfocus) {
        for (const tab of this.tabArray) {
            tabButton != tab && tab.setPressed(false)
            if (unfocus) tab.focus = false
        }
    },
    setCurrentTab(tabIndex, noSound) {
        const button = this.tabArray[tabIndex]
        if (this.prevPressed != button) {
            if (!noSound) sc.BUTTON_SOUND.submit.play()
            this.prevPressed = button!
            button.setPressed(true)

            this._resetButtons(button)
            this._rearrangeTabs()
            this.lastButtonData = button.data
            for (let i = this.tabArray.length; i--; )
                if (button == this.tabArray[i]) {
                    // this._refocusFromCycle = b
                    this.currentTab = i
                    sc.Model.notifyObserver(sc.menu, sc.MENU_EVENT.OPTION_CHANGED_TAB)
                    break
                }
            ig.input.mouseGuiActive && sc.menu.setInfoText('')
        }
    },

    showMenu() {
        sc.menu.buttonInteract.addParallelGroup(this.tabGroup)
        ig.interact.setBlockDelay(0.2)

        this.keyBinder = new sc.KeyBinderGui()
        ig.gui.addGuiElement(this.keyBinder)
        sc.keyBinderGui = this.keyBinder

        this.doStateTransition('DEFAULT')
    },
    hideMenu() {
        sc.menu.buttonInteract.removeParallelGroup(this.tabGroup)

        this.list.deactivate()
        this.keyBinder.remove()
        sc.keyBinderGui = null

        this.doStateTransition('HIDDEN')
    },

    addObservers() {
        sc.Model.addObserver(sc.menu, this)
    },
    removeObservers() {
        sc.Model.removeObserver(sc.menu, this)
    },
    modelChanged(model, message, _data) {
        if (model == sc.menu) {
            if (message == sc.MENU_EVENT.OPTION_CHANGED_TAB) {
                this._createCacheList(this.lastButtonData.type, ig.input.mouseGuiActive, !ig.input.mouseGuiActive)
            }
        }
    },
})
