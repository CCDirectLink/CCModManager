import { ModListEntryHighlight } from './list-entry-highlight'
import { ModMenuList } from './list'
import { ModEntry } from '../types'
import { FileCache } from '../cache'

export interface ModListEntry extends ig.FocusGui {
    ninepatch: ig.NinePatch
    nameText: sc.TextGui
    description?: sc.TextGui
    versionText: sc.TextGui
    installRemoveButton: sc.ButtonGui
    checkForUpdatesButton: sc.ButtonGui
    openModSettingsButton: sc.ButtonGui
    modList: ModMenuList
    highlight: ModListEntryHighlight
    modEntryActionButtonStart: { height: number; ninepatch: ig.NinePatch; highlight: sc.ButtonGui.Highlight }
    modEntryActionButtons: sc.ButtonGui.Type & { ninepatch: ig.NinePatch }
    iconGui: ig.ImageGui
}
interface ModListEntryConstructor extends ImpactClass<ModListEntry> {
    new (mod: ModEntry, modList: ModMenuList): ModListEntry
}

export const ModListEntry: ModListEntryConstructor = ig.FocusGui.extend({
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
        this.modList = modList

        const buttonSquareSize = 14

        this.setSize(modList.hook.size.x - 3 /* 3 for scrollbar */, 43 /*modList.entrySize*/)

        this.nameText = new sc.TextGui(mod.name)

        this.description = new sc.TextGui(mod.description ?? '', { font: sc.fontsystem.smallFont })

        const iconOffset = 24 + 1
        this.nameText.setPos(4 + iconOffset, 0)
        this.description.setPos(4 + iconOffset, 14)

        this.versionText = new sc.TextGui(mod.version, { font: sc.fontsystem.tinyFont })

        this.versionText.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP)
        this.versionText.setPos(3, 3)

        FileCache.getIconConfig(mod).then(config => {
            const image = new ig.Image(config.path)
            this.iconGui = new ig.ImageGui(image, config.offsetX, config.offsetY, config.sizeX, config.sizeY)
            this.iconGui.setPos(2, 8)
            this.addChildGui(this.iconGui)
        })

        this.highlight = new ModListEntryHighlight(this.hook.size.x, this.hook.size.y, this.nameText.hook.size.x, buttonSquareSize * 3)
        this.highlight.setPos(iconOffset, 0)
        this.addChildGui(this.highlight)
        this.addChildGui(this.nameText)
        this.addChildGui(this.description)
        this.addChildGui(this.versionText)
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
