export {}
declare global {
    namespace modmanager.gui {
        interface MultiPageButtonBoxGui extends sc.MultiPageBoxGui {
            userButtonGroup?: sc.ButtonGroup
            buttonConfigs?: {
                name: string
                onPress: (pageIndex: number) => void
            }[]

            setContent(this: this, defaultHeaderText: string, pages: sc.MultiPageBoxGui.ConditionalPage[]): void
        }
        interface MultiPageButtonBoxGuiConstructor extends ImpactClass<MultiPageButtonBoxGui> {
            new (
                width?: number,
                height?: number,
                buttons?: modmanager.gui.MultiPageButtonBoxGui['buttonConfigs']
            ): MultiPageButtonBoxGui
        }
        var MultiPageButtonBoxGui: MultiPageButtonBoxGuiConstructor
    }
}

modmanager.gui.MultiPageButtonBoxGui = sc.MultiPageBoxGui.extend({
    init(width = 568 - 120, height = 320 - 30, buttonConfigs) {
        this.buttonConfigs = buttonConfigs
        this.parent(width, height)
        this.hook.zIndex = 15e4
        this.hook.pauseGui = true
    },
    setContent(defaultHeaderText, pages) {
        this.setDefaultHeaderText(defaultHeaderText)

        this.pages = []
        this.pageCounter.setMax(0)
        this.addPages(pages)
    },
    openMenu(...args) {
        this.hook.removeAfterTransition = false
        this.parent(...args)
        ig.gui.addGuiElement(this)
    },
    _createInitContent(width) {
        /* this is the most hacky function ive ever written */
        const height = this.content.hook.size.y
        const backup = sc.HelpScrollContainer.prototype.setSize

        const negativeScrollContainerHeight = this.buttonConfigs ? 12 : 0
        sc.HelpScrollContainer.prototype.setSize = function (this: sc.HelpScrollContainer) {
            backup.bind(this)(width + 1, height - 34 - negativeScrollContainerHeight)
        }
        this.parent(width)
        sc.HelpScrollContainer.prototype.setSize = backup

        for (const line of this.content.hook.children.filter(c => c.gui instanceof sc.LineGui).map(e => e.gui)) {
            line.setSize(width, line.hook.size.y)
        }

        const y = this.pageCounter.hook.pos.y
        this.content.removeChildGui(this.pageCounter)

        const gui = new sc.MaxNumberGui(0, 0)
        const newGui = Object.assign(gui, {
            setMax: gui.setMaxNumber.bind(gui),
            setCount: gui.setNumber.bind(gui),
            count: undefined as unknown as sc.NumberGui,
            max: undefined as unknown as sc.NumberGui,
        })
        newGui.hook.transitions['HIDDEN'] = this.pageCounter.transitions['HIDDEN']

        this.pageCounter = newGui

        this.pageCounter.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP)
        this.pageCounter.setPos(width / 2 - 4, y)
        this.content.addChildGui(this.pageCounter)

        if (this.buttonConfigs) {
            const spacing = 4
            let x = spacing
            const y = this.pageCounter.hook.pos.y

            this.userButtonGroup = new sc.ButtonGroup()

            for (let i = 0; i < this.buttonConfigs.length; i++) {
                const { name, onPress: callback } = this.buttonConfigs[i]

                const b = new sc.ButtonGui(name, undefined, undefined, sc.BUTTON_TYPE.SMALL)
                b.onButtonPress = () => callback(this.curPage)

                b.setPos(x, y)
                x += b.hook.size.x + spacing

                this.userButtonGroup.addFocusGui(b, i, 0)
                b.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP)
                this.content.addChildGui(b)
            }

            this.buttonInteract.pushButtonGroup(this.userButtonGroup)

            const pos = this.pageCounter.hook.pos
            this.pageCounter.setPos(Math.max(pos.x, x + 10), pos.y + negativeScrollContainerHeight / 2)
        }
    },
    _setPage(index) {
        this.parent(index)

        const gui = this.scrollContainer.content.hook.children[0].gui
        gui.setSize(this._width - 4, gui.hook.size.y)
        this.scrollContainer.setElement(gui)
    },
})
