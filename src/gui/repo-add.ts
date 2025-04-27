import type * as _ from 'nax-ccuilib/src/headers/nax/input-field.d.ts'
import type * as __ from 'nax-ccuilib/src/headers/nax/input-field-cursor.d.ts'
import type * as ___ from 'nax-ccuilib/src/headers/nax/input-field-type.d.ts'
import { ModDB } from '../moddb'

declare global {
    namespace modmanager.gui {
        interface RepoAddPopup extends ig.GuiElementBase {
            gfx: ig.Image
            buttonInteract: ig.ButtonInteractEntry
            buttonGroup: sc.ButtonGroup
            urlFields: nax.ccuilib.InputField[]
            isOkTexts: sc.TextGui[]

            getTextUnknown(this: this): string
            getTextOk(this: this): string
            getTextBad(this: this): string
            show(this: this): void
            hide(this: this): void
        }
        interface RepoAddPopupConstructor extends ImpactClass<RepoAddPopup> {
            new (): RepoAddPopup
        }
        var RepoAddPopup: RepoAddPopupConstructor
    }
}

/* https://www.freecodecamp.org/news/check-if-a-javascript-string-is-a-url/ */
function isValidUrl(urlString: string) {
    var urlPattern = new RegExp(
        '^(https?:\\/\\/)?' + // validate protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
            '(\\#[-a-z\\d_]*)?$',
        'i'
    ) // validate fragment locator
    return !!urlPattern.test(urlString)
}

modmanager.gui.RepoAddPopup = ig.GuiElementBase.extend({
    gfx: new ig.Image('media/gui/menu.png'),
    transitions: {
        DEFAULT: { state: { alpha: 1 }, time: 0.2, timeFunction: KEY_SPLINES.EASE_OUT },
        HIDDEN: { state: { alpha: 0 }, time: 0.3, timeFunction: KEY_SPLINES.EASE_IN },
    },
    init() {
        this.parent()
        this.hook.zIndex = 9999999
        this.hook.localAlpha = 0.8
        this.hook.temporary = true
        this.hook.pauseGui = true
        this.hook.size.x = ig.system.width
        this.hook.size.y = ig.system.height

        const box = new ig.GuiElementBase()

        const offset: Vec2 = { x: 0, y: 3 }
        const inputFieldColumns = 7
        const spacing = 4
        const urlInputFieldW = 500
        const inputFieldH = 20
        const isOkW = 20
        box.setSize(urlInputFieldW + spacing + offset.x + isOkW, inputFieldColumns * (inputFieldH + spacing) + offset.y)

        this.buttonInteract = new ig.ButtonInteractEntry()
        this.buttonGroup = new sc.ButtonGroup()
        this.buttonInteract.pushButtonGroup(this.buttonGroup)

        const backButton = new sc.ButtonGui(
            '\\i[back]' + ig.lang.get('sc.gui.menu.back'),
            undefined,
            true,
            sc.BUTTON_TYPE.SMALL,
            sc.BUTTON_SOUND.back
        )
        backButton.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP)
        backButton.setPos(0, 0)
        backButton.onButtonPress = () => {
            this.hide()
        }
        this.buttonGroup.addFocusGui(backButton, 100, 100, true)
        this.addChildGui(backButton)

        this.urlFields = []
        this.isOkTexts = []
        for (let yi = 0; yi < inputFieldColumns; yi++) {
            const y = yi * (inputFieldH + spacing) + offset.y

            const isOkText = new sc.TextGui('')
            this.isOkTexts.push(isOkText)
            isOkText.setPos(offset.x, y)
            box.addChildGui(isOkText)

            const urlField = new nax.ccuilib.InputField(urlInputFieldW, inputFieldH)
            urlField.setPos(offset.x + isOkW, y)
            urlField.onCharacterInput = value => {
                let icon!: string
                let dbToCheck: ModDB | undefined
                if (!value) {
                    icon = ''
                } else if (value.startsWith('@')) {
                    dbToCheck = new ModDB(value, false, false)
                    icon = this.getTextOk()
                } else {
                    if (!isValidUrl(value)) {
                        icon = this.getTextBad()
                    } else dbToCheck = new ModDB(value, false, false)
                }
                if (dbToCheck) {
                    icon = this.getTextUnknown()
                    dbToCheck.isUrlValid().then(isOk => {
                        if (urlField.getValueAsString() == value) {
                            isOkText.setText(isOk ? this.getTextOk() : this.getTextBad())
                        }
                    })
                }
                isOkText.setText(icon)
            }

            this.urlFields.push(urlField)
            this.buttonGroup.addFocusGui(urlField, 100, 101)
            box.addChildGui(urlField)
        }

        const center = new sc.CenterBoxGui(box)
        center.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER)
        this.addChildGui(center)

        this.doStateTransition('HIDDEN')
    },
    updateDrawables(renderer) {
        renderer.addColor('#000', 0, 0, this.hook.size.x, this.hook.size.y)
    },
    getTextUnknown() {
        return '\\i[lore-others]'
    },
    getTextOk() {
        return '\\i[quest-solve]'
    },
    getTextBad() {
        return '\\i[quest-elite]'
    },
    show() {
        ig.gui.addGuiElement(this)
        this.doStateTransition('DEFAULT')
        ig.interact.addEntry(this.buttonInteract)
        ig.interact.setBlockDelay(0.2)
        sc.menu.pushBackCallback(() => {})

        const dbNames = Object.keys(ModDB.databases)
        for (let i = 0; i < dbNames.length; i++) {
            const urlField = this.urlFields[i]
            const dbName = dbNames[i]
            const db = ModDB.databases[dbName]
            urlField.setText?.(ModDB.minifyRepoURL(db.url))
            this.isOkTexts[i].setText(this.getTextOk())
        }
    },
    hide() {
        for (const isOkText of this.isOkTexts) {
            const text = isOkText.text?.toString()
            if (text == this.getTextBad() || text == this.getTextUnknown()) return
        }
        this.doStateTransition('HIDDEN', undefined, true)
        ig.interact.removeEntry(this.buttonInteract)
        ig.interact.setBlockDelay(0.2)
        sc.menu.popBackCallback()

        ModDB.databases = {}

        for (let i = 0; i < this.urlFields.length; i++) {
            const urlField = this.urlFields[i]
            const url = urlField.getValueAsString()
            if (url) ModDB.addDatabase(new ModDB(url))
            urlField.setText('')
            this.isOkTexts[i].setText('')
        }
        ModDB.saveDatabases()
    },
})
