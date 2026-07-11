import type { ModImageConfig } from '../types'
import { Opts } from '../options'
import { COLOR } from './colors'

import './list-entry-highlight'

export interface ListEntryConfig {
    description?: string
    version?: string
    authors?: string[]
    tags?: string[]
    lastUpdateTimestamp?: number
    stars?: number
}

declare global {
    namespace modmanager.gui {
        interface ListEntry extends ig.FocusGui, sc.Model.Observer {
            ninepatch: ig.NinePatch
            iconOffset: number
            nameIconPrefixesText: sc.TextGui
            nameText: sc.TextGui
            textColor: COLOR
            description: sc.TextGui
            versionText: sc.TextGui
            starCount?: sc.TextGui
            lastUpdated?: sc.TextGui
            authors?: sc.TextGui
            tags?: sc.TextGui
            modList: modmanager.gui.MenuList
            highlight: ListEntryHighlight
            modEntryActionButtonStart: { height: number; ninepatch: ig.NinePatch; highlight: sc.ButtonGui.Highlight }
            modEntryActionButtons: sc.ButtonGui.Type & { ninepatch: ig.NinePatch }
            iconGui: ig.ImageGui

            addObservers(this: this): void
            removeObservers(this: this): void
            updateIcon(this: this, config: ModImageConfig): void
            setNameText(this: this, color?: COLOR): void
            updateHighlightWidth(this: this): void

            // abstract classes
            getName(this: this): { icon: string; text: string }
            getIcon(this: this): Promise<ModImageConfig>
            onButtonPress(this: this): void
        }
        interface ListEntryConstructor extends ImpactClass<ListEntry> {
            new (config: ListEntryConfig, modList: modmanager.gui.MenuList): ListEntry
        }
        var ListEntry: ListEntryConstructor
    }
}

modmanager.gui.ListEntry = ig.FocusGui.extend({
    ninepatch: new ig.NinePatch('media/gui/CCModManager.png', {
        width: 42,
        height: 26,
        left: 1,
        top: 14,
        right: 1,
        bottom: 0,
        offsets: { default: { x: 0, y: 0 }, focus: { x: 0, y: 41 } },
    }),

    init(config, modList) {
        this.parent()

        this.modList = modList

        const isGrid = Opts.isGrid
        this.getIcon().then(config => this.updateIcon(config))

        const height = 42
        this.iconOffset = 25

        const regularWidth = modList.hook.size.x - (isGrid ? Math.ceil(3 / modList.gridColumns) : 3)
        if (isGrid) {
            this.setSize(regularWidth / modList.gridColumns, 26)
        } else {
            this.setSize(regularWidth, height - 3)
        }

        this.nameText = new sc.TextGui('')
        this.nameIconPrefixesText = new sc.TextGui('')
        this.setNameText(COLOR.WHITE)

        this.highlight = new modmanager.gui.ListEntryHighlight(
            this.hook.size.x,
            this.hook.size.y,
            this.nameText.hook.size.x,
            height
        )
        this.highlight.setPos(this.iconOffset, 0)
        this.addChildGui(this.highlight)
        this.addChildGui(this.nameText)
        this.addChildGui(this.nameIconPrefixesText)

        if (!isGrid) {
            const tags = config.tags
            if (tags) {
                const tagsLength = tags.join(', ').length
                const str = tags.map(a => `\\c[0]${a}\\c[0]`).join(', ')
                const useTinyFont = tagsLength > 100
                this.tags = new sc.TextGui(str, {
                    font: useTinyFont ? sc.fontsystem.tinyFont : sc.fontsystem.smallFont,
                    maxWidth: 130 + (tagsLength > 50 ? 60 : 0),
                    linePadding: useTinyFont ? 0 : -4,
                })
                this.tags.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP)
                this.tags.setPos(4, 15)
                this.addChildGui(this.tags)
            }

            this.description = new sc.TextGui(config.description ?? '', {
                font: sc.fontsystem.smallFont,
                maxWidth: this.hook.size.x - (this.tags?.hook.size.x ?? 0) - 50,
                linePadding: -4,
            })
            this.description.setPos(4 + this.iconOffset, 14)
            this.addChildGui(this.description)

            const authors = config.authors
            if (authors && authors.length > 0) {
                const str = `by ${authors.map(a => `\\c[3]${a}\\c[0]`).join(', ')}`
                this.authors = new sc.TextGui(str, { font: sc.fontsystem.smallFont, linePadding: -1 })
                this.addChildGui(this.authors)
            }

            this.versionText = new sc.TextGui(`v${config.version}`, { font: sc.fontsystem.tinyFont })
            this.versionText.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP)
            this.versionText.setPos(3, 3)
            this.addChildGui(this.versionText)

            if (config?.lastUpdateTimestamp !== undefined) {
                const date = new Date(config.lastUpdateTimestamp)
                const dateStr = date.toLocaleDateString('pl-PL', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                })
                this.lastUpdated = new sc.TextGui(dateStr, { font: sc.fontsystem.tinyFont })
                this.lastUpdated.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP)
                this.lastUpdated.setPos(3, 10)
                this.addChildGui(this.lastUpdated)
            }

            if (config?.stars !== undefined) {
                this.starCount = new sc.TextGui(`${config.stars}\\i[save-star]`)
                this.starCount.setAlign(ig.GUI_ALIGN_X.RIGHT, ig.GUI_ALIGN_Y.TOP)
                this.starCount.setPos(53, 0)
                this.addChildGui(this.starCount)
            }
        }
        this.updateHighlightWidth()
    },
    onAttach() {
        sc.Model.addObserver(modmanager.gui.menu, this)
    },
    onDetach() {
        sc.Model.removeObserver(modmanager.gui.menu, this)
    },
    updateIcon(config) {
        const image = new ig.Image(config.path)
        this.iconGui = new ig.ImageGui(image, config.offsetX, config.offsetY, config.sizeX, config.sizeY)
        if (Opts.isGrid) this.iconGui.setPos(2, 2)
        else this.iconGui.setPos(2, 8)
        this.addChildGui(this.iconGui)
    },
    setNameText(color?: COLOR) {
        color ??= this.textColor
        const { text, icon } = this.getName()
        this.nameIconPrefixesText.setText(icon)
        this.nameIconPrefixesText.setPos(4 + this.iconOffset, 0)

        this.nameText.setFont(sc.fontsystem.font)
        this.textColor = color
        this.nameText.setText(`\\c[${color}]${text}\\c[0]`)
        this.nameText.setPos(4 + this.iconOffset + this.nameIconPrefixesText.hook.size.x, 0)

        if (
            Opts.isGrid ||
            this.nameText.hook.size.x + this.nameIconPrefixesText.hook.size.x - 17 >=
                this.hook.size.x - this.nameText.hook.pos.x
        ) {
            this.nameText.setFont(sc.fontsystem.smallFont)
            this.nameText.hook.pos.y = 2
        } else {
            this.nameText.hook.pos.y = 0
        }
        this.updateHighlightWidth()
    },
    updateHighlightWidth() {
        if (this.authors) {
            this.authors.setPos(this.nameText.hook.pos.x + this.nameText.hook.size.x + 4, 2)
            if (this.authors.font !== sc.fontsystem.tinyFont) {
                const spaceLeft =
                    this.hook.size.x -
                    this.authors.hook.pos.x -
                    (this.starCount
                        ? this.starCount.hook.pos.x + this.starCount.hook.size.x
                        : this.versionText.hook.pos.x + this.versionText.hook.size.x)
                const freeSpace = spaceLeft - this.authors.hook.size.x
                if (freeSpace <= 0) {
                    this.authors.setFont(sc.fontsystem.tinyFont)
                    this.authors.setMaxWidth(spaceLeft)
                }
            }
        }
        const authorsW = this.authors?.hook.size.x
        this.highlight?.updateWidth(
            this.hook.size.x,
            this.nameIconPrefixesText.hook.size.x + this.nameText.hook.size.x + (authorsW ? authorsW + 6 : 0)
        )
    },
    updateDrawables(renderer) {
        if (this.modList.hook.currentStateName != 'HIDDEN') {
            this.ninepatch.draw(renderer, this.hook.size.x, this.hook.size.y, this.focus ? 'focus' : 'default')
        }
    },
    focusGained() {
        this.parent()
        this.highlight.focus = this.focus
        sc.Model.notifyObserver(modmanager.gui.menu, modmanager.gui.MENU_MESSAGES.ENTRY_FOCUSED, this)
    },
    focusLost() {
        this.parent()
        this.highlight.focus = this.focus
        sc.Model.notifyObserver(modmanager.gui.menu, modmanager.gui.MENU_MESSAGES.ENTRY_UNFOCUSED, this)
    },
    modelChanged() {},
})
