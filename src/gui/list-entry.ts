import { ModEntry, ModEntryLocal } from '../types'
import { FileCache } from '../cache'
import './list-entry-highlight'
import { LocalMods } from '../local-mods'
import { InstallQueue } from '../mod-installer'
import { ModInstallDialogs, prepareModName } from './install-dialogs'

declare global {
    namespace sc {
        export interface ModListEntry extends ig.FocusGui, sc.Model.Observer {
            ninepatch: ig.NinePatch
            mod: ModEntry
            iconOffset: number
            nameIconPrefixesText: sc.TextGui
            nameText: sc.TextGui
            description: sc.TextGui
            versionText: sc.TextGui
            starCount?: sc.TextGui
            lastUpdated?: sc.TextGui
            authors?: sc.TextGui
            tags?: sc.TextGui
            modList: sc.ModMenuList
            highlight: ModListEntryHighlight
            modEntryActionButtonStart: { height: number; ninepatch: ig.NinePatch; highlight: sc.ButtonGui.Highlight }
            modEntryActionButtons: sc.ButtonGui.Type & { ninepatch: ig.NinePatch }
            iconGui: ig.ImageGui

            tryDisableMod(this: this, mod: ModEntryLocal): string | undefined
            tryEnableMod(this: this, mod: ModEntryLocal): string | undefined
            getModName(this: this): { icon: string; text: string }
            onButtonPress(this: this): void
            setNameText(this: this, color: COLORS): void
            updateHighlightWidth(this: this): void
            onButtonPress(this: this): string | undefined
        }
        interface ModListEntryConstructor extends ImpactClass<ModListEntry> {
            new (mod: ModEntry, modList: sc.ModMenuList): ModListEntry
        }
        var ModListEntry: ModListEntryConstructor
    }
}

enum COLORS {
    WHITE = 0,
    RED = 1,
    GREEN = 2,
    YELLOW = 3,
}

sc.ModListEntry = ig.FocusGui.extend({
    ninepatch: new ig.NinePatch('media/gui/CCModManager.png', {
        width: 42,
        height: 26,
        left: 1,
        top: 14,
        right: 1,
        bottom: 0,
        offsets: { default: { x: 0, y: 0 }, focus: { x: 0, y: 41 } },
    }),

    init(mod, modList) {
        this.parent()
        this.mod = mod
        this.modList = modList

        sc.Model.addObserver(sc.modMenu, this)
        const isGrid = modList.isGrid
        /* init icon asap */
        FileCache.getIconConfig(mod).then(config => {
            const image = new ig.Image(config.path)
            this.iconGui = new ig.ImageGui(image, config.offsetX, config.offsetY, config.sizeX, config.sizeY)
            if (isGrid) this.iconGui.setPos(2, 2)
            else this.iconGui.setPos(2, 8)
            this.addChildGui(this.iconGui)
        })

        const height = 42
        this.iconOffset = 25

        const regularWidth = modList.hook.size.x - (isGrid ? Math.ceil(3 / modList.gridColumns) : 3)
        if (isGrid) {
            this.setSize(regularWidth / modList.gridColumns, 26)
        } else {
            this.setSize(regularWidth, height - 3)
        }

        const localMod = mod.isLocal ? mod : mod.localCounterpart
        const serverMod = mod.isLocal ? mod.serverCounterpart : mod

        this.nameText = new sc.TextGui('')
        this.nameIconPrefixesText = new sc.TextGui('')
        this.setNameText(COLORS.WHITE)

        if (this.modList.currentTabIndex == sc.MOD_MENU_TAB_INDEXES.DISABLED) this.setNameText(COLORS.RED)
        else if (this.modList.currentTabIndex == sc.MOD_MENU_TAB_INDEXES.ENABLED) this.setNameText(COLORS.GREEN)
        else {
            if (localMod) {
                if (localMod.active) this.setNameText(COLORS.GREEN)
                else this.setNameText(COLORS.RED)
            }
        }
        if (InstallQueue.has(mod)) this.setNameText(COLORS.YELLOW)

        this.highlight = new sc.ModListEntryHighlight(this.hook.size.x, this.hook.size.y, this.nameText.hook.size.x, height)
        this.highlight.setPos(this.iconOffset, 0)
        this.addChildGui(this.highlight)
        this.addChildGui(this.nameText)
        this.addChildGui(this.nameIconPrefixesText)

        if (!isGrid) {
            this.description = new sc.TextGui(mod.description ?? '', {
                font: sc.fontsystem.smallFont,
                maxWidth: this.hook.size.x - 110,
                linePadding: -4,
            })
            this.description.setPos(4 + this.iconOffset, 14)
            this.addChildGui(this.description)

            if (serverMod?.authors) {
                const authors = serverMod.authors
                const str = `by ${authors.map(a => `\\c[3]${a}\\c[0]`).join(', ')}`
                this.authors = new sc.TextGui(str, { font: sc.fontsystem.smallFont, linePadding: -1 })
                this.addChildGui(this.authors)
            }

            if (serverMod?.tags) {
                const tags = serverMod.tags
                const str = tags.map(a => `\\c[0]${a}\\c[0]`).join(', ')
                this.tags = new sc.TextGui(str, { font: sc.fontsystem.smallFont, maxWidth: 130, linePadding: -4 })
                this.tags.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP)
                this.tags.setPos(4, 15)
                this.addChildGui(this.tags)
            }

            this.versionText = new sc.TextGui(`v${mod.version}`, { font: sc.fontsystem.tinyFont })
            this.versionText.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP)
            this.versionText.setPos(3, 3)
            this.addChildGui(this.versionText)

            if ('lastUpdateTimestamp' in mod && mod.lastUpdateTimestamp) {
                const date = new Date(mod.lastUpdateTimestamp)
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

            if (mod.stars !== undefined) {
                this.starCount = new sc.TextGui(`${mod.stars}\\i[save-star]`)
                this.starCount.setPos(496 - this.starCount.hook.size.x, 0)
                this.addChildGui(this.starCount)
            }
        }
        this.updateHighlightWidth()
    },
    getModName() {
        let icon: string = ''

        icon += this.mod.database == 'LOCAL' ? '\\i[lore-others]' : '\\i[quest]'

        if (this.mod.awaitingRestart) icon += `\\i[stats-general]`

        const local = this.mod.isLocal ? this.mod : this.mod.localCounterpart
        if (local && local.hasUpdate) {
            icon += `\\i[item-news]`
        }
        if (local?.isGit) {
            icon += '\\i[ccmodmanager-git]'
        }

        return { icon, text: prepareModName(this.mod.name) }
    },
    setNameText(color: COLORS) {
        const { text, icon } = this.getModName()
        this.nameIconPrefixesText.setText(icon)
        this.nameIconPrefixesText.setPos(4 + this.iconOffset, 0)

        this.nameText.setFont(sc.fontsystem.font)
        this.nameText.setText(`\\c[${color}]${text}\\c[0]`)
        this.nameText.setPos(4 + this.iconOffset + this.nameIconPrefixesText.hook.size.x, 0)

        if (this.nameText.hook.size.x + this.nameIconPrefixesText.hook.size.x - 17 >= this.hook.size.x - this.nameText.hook.pos.x) {
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
                const spaceLeft = this.hook.size.x - this.authors.hook.pos.x - (this.hook.size.x - (this.starCount?.hook.pos.x ?? this.versionText.hook.pos.x))
                const freeSpace = spaceLeft - this.authors.hook.size.x
                if (freeSpace <= 0) {
                    this.authors.setFont(sc.fontsystem.tinyFont)
                    this.authors.setMaxWidth(spaceLeft)
                }
            }
        }
        const authorsW = this.authors?.hook.size.x
        this.highlight?.updateWidth(this.hook.size.x, this.nameIconPrefixesText.hook.size.x + this.nameText.hook.size.x + (authorsW ? authorsW + 6 : 0))
    },
    updateDrawables(renderer) {
        if (this.modList.hook.currentStateName != 'HIDDEN') {
            this.ninepatch.draw(renderer, this.hook.size.x, this.hook.size.y, this.focus ? 'focus' : 'default')
        }
    },
    focusGained() {
        this.parent()
        this.highlight.focus = this.focus
        sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.ENTRY_FOCUSED, this)
    },
    focusLost() {
        this.parent()
        this.highlight.focus = this.focus
        sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.ENTRY_UNFOCUSED, this)
    },
    tryEnableMod(mod: ModEntryLocal) {
        ModInstallDialogs.checkCanEnableMod(mod).then(deps => {
            if (deps === undefined) return
            deps.push(mod)
            for (const mod of deps) {
                mod.awaitingRestart = !mod.awaitingRestart
                sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.ENTRY_UPDATE_COLOR, { mod, color: COLORS.GREEN })
                sc.BUTTON_SOUND.toggle_on.play()
                LocalMods.setModActive(mod, true)
                this.updateHighlightWidth()
            }
        })
        return 'Enabled'
    },
    tryDisableMod(mod: ModEntryLocal) {
        if (!ModInstallDialogs.checkCanDisableMod(mod)) {
            sc.BUTTON_SOUND.denied.play()
            return
        }
        mod.awaitingRestart = !mod.awaitingRestart
        this.setNameText(COLORS.RED)
        sc.BUTTON_SOUND.toggle_off.play()
        LocalMods.setModActive(mod, false)
        this.updateHighlightWidth()
        return 'Disabled'
    },
    modelChanged(model, message: sc.MOD_MENU_MESSAGES, data) {
        const d = data as { mod: ModEntryLocal; color: COLORS }
        if (model == sc.modMenu && message == sc.MOD_MENU_MESSAGES.ENTRY_UPDATE_COLOR && d.mod == this.mod) {
            this.setNameText(d.color)
        }
    },
    onButtonPress() {
        let mod = this.mod
        if (mod.isLocal) {
            if (this.modList.currentTabIndex == sc.MOD_MENU_TAB_INDEXES.ENABLED || this.modList.currentTabIndex == sc.MOD_MENU_TAB_INDEXES.DISABLED) {
                if (mod.active) return this.tryDisableMod(mod)
                else return this.tryEnableMod(mod)
            } else throw new Error('wat?')
        } else if (mod.localCounterpart) {
            const localMod = mod.localCounterpart
            if (localMod.hasUpdate) {
                if (InstallQueue.has(mod)) {
                    if (localMod.active) this.setNameText(COLORS.GREEN)
                    else this.setNameText(COLORS.RED)
                    sc.BUTTON_SOUND.toggle_off.play()
                    InstallQueue.delete(mod)
                    this.updateHighlightWidth()
                    return 'Un-selected'
                } else {
                    this.setNameText(COLORS.YELLOW)
                    sc.BUTTON_SOUND.toggle_on.play()
                    InstallQueue.add(mod)
                    this.updateHighlightWidth()
                    return 'Selected'
                }
            } else sc.BUTTON_SOUND.denied.play()
        } else {
            if (InstallQueue.has(mod)) {
                InstallQueue.delete(mod)
                sc.BUTTON_SOUND.toggle_off.play()
                this.setNameText(COLORS.WHITE)
                return 'Un-Selected'
            } else {
                InstallQueue.add(mod)
                sc.BUTTON_SOUND.toggle_on.play()
                this.setNameText(COLORS.YELLOW)
                return 'Selected'
            }
        }
    },
})
