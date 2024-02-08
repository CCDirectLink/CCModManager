import { ModListEntryHighlight } from './list-entry-highlight'
import { ModMenuList } from './list'
import { ModEntry } from '../types'
import { FileCache } from '../cache'
import { databases } from '../moddb'

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
    modList: ModMenuList
    highlight: ModListEntryHighlight
    modEntryActionButtonStart: { height: number; ninepatch: ig.NinePatch; highlight: sc.ButtonGui.Highlight }
    modEntryActionButtons: sc.ButtonGui.Type & { ninepatch: ig.NinePatch }
    iconGui: ig.ImageGui

    askInstall(this: this): void
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

        this.nameText = new sc.TextGui(mod.name)

        const iconOffset = 25 as const
        this.highlight = new ModListEntryHighlight(this.hook.size.x, this.hook.size.y, this.nameText.hook.size.x, buttonSquareSize * 3)
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
            // this.starCount.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP)
            this.starCount.setPos(517 - this.starCount.hook.size.x, 0) //this.versionText.hook.size.x + 4, 3)
            this.addChildGui(this.starCount)
        }

        this.onButtonPress = () => this.askInstall()
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
    askInstall() {
        sc.Dialogs.showChoiceDialog(
            ig.lang.get('sc.gui.menu.ccmodloader.areYouSure').replace(/\[modName\]/, this.mod.name),
            sc.DIALOG_INFO_ICON.QUESTION,
            [
                ig.lang.get('sc.gui.dialogs.no'),
                ig.LangLabel.getText({
                    en_US: '[nods]',
                    de_DE: '[nickt]',
                    zh_CN: '[\u70b9\u5934]<<A<<[CHANGED 2017/10/10]',
                    ko_KR: '[\ub044\ub355]<<A<<[CHANGED 2017/10/17]',
                    ja_JP: '[\u3046\u306a\u305a\u304f]<<A<<[CHANGED 2017/11/04]',
                    zh_TW: '[\u9ede\u982d]<<A<<[CHANGED 2017/10/10]',
                    langUid: 13455,
                }),
            ],
            button => {
                const resp = button?.text
                if (resp == '[nods]') {
                    databases[this.mod.database].downloadMod(this.mod.id)
                }
            }
        )
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
