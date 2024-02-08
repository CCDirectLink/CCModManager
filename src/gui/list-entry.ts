import { ModEntry } from '../types'
import { FileCache } from '../cache'
import { InstallQueue } from '../install-queue'
import './list-entry-highlight'
import { InstalledMods } from '../local-mods'
import { MOD_MENU_TAB_INDEXES } from './list'

declare global {
    namespace sc {
        export interface ModListEntry extends ig.FocusGui {
            ninepatch: ig.NinePatch
            mod: ModEntry
            nameText: sc.TextGui
            description: sc.TextGui
            versionText: sc.TextGui
            starCount?: sc.TextGui
            installRemoveButton: sc.ButtonGui
            checkForUpdatesButton: sc.ButtonGui
            openModSettingsButton: sc.ButtonGui
            modList: sc.ModMenuList
            highlight: ModListEntryHighlight
            modEntryActionButtonStart: { height: number; ninepatch: ig.NinePatch; highlight: sc.ButtonGui.Highlight }
            modEntryActionButtons: sc.ButtonGui.Type & { ninepatch: ig.NinePatch }
            iconGui: ig.ImageGui

            getModName(this: this): string
            onButtonPress(this: this): void
            setTextGreen(this: this): void
            setTextRed(this: this): void
            setTextWhite(this: this): void
        }
        interface ModListEntryConstructor extends ImpactClass<ModListEntry> {
            new (mod: ModEntry, modList: sc.ModMenuList): ModListEntry
        }
        var ModListEntry: ModListEntryConstructor
    }
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
    modEntryActionButtonStart: {
        height: 14,
        ninepatch: new ig.NinePatch('media/gui/CCModManager.png', {
            left: 5,
            width: 8,
            right: 1,
            top: 11,
            height: 2,
            bottom: 1,
            offsets: { default: { x: 42, y: 82 }, focus: { x: 56, y: 82 }, pressed: { x: 56, y: 82 } },
        }),
        highlight: {
            startX: 70,
            endX: 84,
            leftWidth: 3,
            rightWidth: 1,
            offsetY: 82,
            gfx: new ig.Image('media/gui/CCModManager.png'),
            pattern: new ig.ImagePattern('media/gui/CCModManager.png', 74, 82, 9, 14),
        },
    },
    modEntryActionButtons: {
        height: 14,
        ninepatch: new ig.NinePatch('media/gui/CCModManager.png', {
            left: 1,
            width: 12,
            right: 1,
            top: 1,
            height: 12,
            bottom: 1,
            offsets: { default: { x: 0, y: 82 }, focus: { x: 14, y: 82 }, pressed: { x: 14, y: 82 } },
        }),
        highlight: {
            startX: 28,
            endX: 42,
            leftWidth: 2,
            rightWidth: 2,
            offsetY: 82,
            gfx: new ig.Image('media/gui/CCModManager.png'),
            pattern: new ig.ImagePattern('media/gui/CCModManager.png', 30, 82, 10, 14, ig.ImagePattern.OPT.REPEAT_X),
        },
    },

    init(mod, modList) {
        this.parent()
        this.mod = mod
        this.modList = modList

        /* init icon asap */
        FileCache.getIconConfig(mod).then(config => {
            const image = new ig.Image(config.path)
            this.iconGui = new ig.ImageGui(image, config.offsetX, config.offsetY, config.sizeX, config.sizeY)
            this.iconGui.setPos(2, 8)
            this.addChildGui(this.iconGui)
        })

        const buttonSquareSize = 14

        this.setSize(modList.hook.size.x - 3 /* 3 for scrollbar */, buttonSquareSize * 3 - 3)

        this.nameText = new sc.TextGui('')
        if (InstallQueue.has(mod)) this.setTextGreen()
        else this.setTextWhite()

        const iconOffset = 25 as const
        this.highlight = new sc.ModListEntryHighlight(this.hook.size.x, this.hook.size.y, this.nameText.hook.size.x, buttonSquareSize * 3)
        this.highlight.setPos(iconOffset, 0)
        this.addChildGui(this.highlight)
        this.addChildGui(this.nameText)

        this.description = new sc.TextGui(mod.description ?? '', { font: sc.fontsystem.smallFont })
        this.addChildGui(this.description)

        this.nameText.setPos(4 + iconOffset, 0)
        this.description.setPos(4 + iconOffset, 14)

        this.versionText = new sc.TextGui(`v${mod.version}`, { font: sc.fontsystem.tinyFont })
        this.versionText.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP)
        this.versionText.setPos(3, 3)
        this.addChildGui(this.versionText)

        if (mod.stars !== undefined) {
            this.starCount = new sc.TextGui(`${mod.stars}\\i[save-star]`)
            this.starCount.setPos(517 - this.starCount.hook.size.x, 0)
            this.addChildGui(this.starCount)
        }
    },
    getModName() {
        let name = this.mod.name.replace(/\\c\[\d]/g, '')
        let icon: string
        if (this.mod.database == 'LOCAL') {
            icon = 'lore-others'
        } else {
            icon = 'quest'
        }
        name = `\\i[${icon}]${name}`
        return name
    },
    setTextGreen() {
        this.nameText.setText(`\\c[2]${this.getModName()}\\c[0]`)
    },
    setTextRed() {
        this.nameText.setText(`\\c[1]${this.getModName()}\\c[0]`)
    },
    setTextWhite() {
        this.nameText.setText(this.getModName())
    },
    updateDrawables(root) {
        if (this.modList.hook.currentStateName != 'HIDDEN') {
            this.ninepatch.draw(root, this.hook.size.x, this.hook.size.y, this.focus ? 'focus' : 'default')
        }
    },
    focusGained() {
        this.parent()
        this.highlight.focus = this.focus
    },
    focusLost() {
        this.parent()
        this.highlight.focus = this.focus
    },
    onButtonPress() {
        if (this.mod.isLocal) {
            if (this.modList.currentTabIndex == MOD_MENU_TAB_INDEXES.ENABLED) {
                if (this.mod.active) {
                    this.setTextRed()
                    InstalledMods.setModActive(this.mod, false)
                } else {
                    this.setTextWhite()
                    InstalledMods.setModActive(this.mod, true)
                }
            } else if (this.modList.currentTabIndex == MOD_MENU_TAB_INDEXES.DISABLED) {
                if (this.mod.active) {
                    this.setTextWhite()
                    InstalledMods.setModActive(this.mod, false)
                } else {
                    this.setTextGreen()
                    InstalledMods.setModActive(this.mod, true)
                }
            } else throw new Error('wat?')
        } else {
            if (InstallQueue.has(this.mod)) {
                InstallQueue.delete(this.mod)
                sc.BUTTON_SOUND.toggle_off.play()
                this.setTextWhite()
            } else {
                InstallQueue.add(this.mod)
                sc.BUTTON_SOUND.toggle_on.play()
                this.setTextGreen()
            }
        }
    },
})

// this.openModSettingsButton = new sc.ButtonGui('\\i[mod-config]', buttonSquareSize - 1, true, this.modEntryActionButtons)
// this.openModSettingsButton.setPos(2, 1)
// this.openModSettingsButton.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_BOTTOM)

// this.checkForUpdatesButton = new sc.ButtonGui('\\i[mod-refresh]', buttonSquareSize - 1, true, this.modEntryActionButtons)
// this.checkForUpdatesButton.setPos(this.openModSettingsButton.hook.pos.x + this.openModSettingsButton.hook.size.x + 1, 1)
// this.checkForUpdatesButton.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_BOTTOM)

// this.installRemoveButton = new sc.ButtonGui('\\i[mod-download]', buttonSquareSize - 1, true, this.modEntryActionButtonStart)
// this.installRemoveButton.setPos(this.checkForUpdatesButton.hook.pos.x + this.checkForUpdatesButton.hook.size.x + 1, 1)
// this.installRemoveButton.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_BOTTOM)
// this.installRemoveButton.onButtonPress = () => {
//     database
//         .downloadMod(id)
//         .then(() => sc.Dialogs.showDialog(`${name} installed.`))
//         .catch(err => sc.Dialogs.showErrorDialog(err.message))
// }
// ;[this.installRemoveButton, this.checkForUpdatesButton, this.openModSettingsButton].forEach(button => {
//     this.addChildGui(button)
//     this.modList.buttonGroup.addFocusGui(button)
//     button.focusGained = () => {
//         this.focusGained()
//     }
//     button.focusLost = () => {
//         this.focusLost()
//     }
//     button.textChild.setPos(1, 3)
// })
