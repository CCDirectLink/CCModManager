import { ModEntryServer } from '../types'
import { generateChangelogPage } from './changelog-page-generator'

declare global {
    namespace modmanager.gui {
        interface Changelog extends sc.MultiPageBoxGui {
            setMod(this: this, mod: ModEntryServer): void
        }
        interface ChangelogConstructor extends ImpactClass<Changelog> {
            new (): Changelog
        }
        var Changelog: ChangelogConstructor
    }
}

modmanager.gui.Changelog = sc.MultiPageBoxGui.extend({
    init() {
        this.parent(568 - 120, 320 - 30)
        this.hook.zIndex = 15e4
        this.hook.pauseGui = true
    },
    setMod(mod) {
        if (!mod.releasePages) throw new Error('das')

        this.setDefaultHeaderText(mod.name)

        const pages = mod.releasePages.map(page => generateChangelogPage(page))
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
        sc.HelpScrollContainer.prototype.setSize = function (this: sc.HelpScrollContainer) {
            backup.bind(this)(width + 1, height - 34)
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

        this.pageCounter.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_TOP)
        this.pageCounter.setPos(0, y)
        this.content.addChildGui(this.pageCounter)
    },
    _setPage(index) {
        this.parent(index)

        const gui = this.scrollContainer.content.hook.children[0].gui
        gui.setSize(this._width - 4, gui.hook.size.y)
        this.scrollContainer.setElement(gui)
    },
})
