import './input-field-cursor'
import './input-field-type'

declare global {
    namespace modmanager.gui {
        interface InputField extends ig.FocusGui {
            gfx: ig.Image
            value: string[]
            bg: sc.ButtonBgGui
            focusTimer: number
            alphaTimer: number
            animateOnPress: boolean
            noFocusOnPressed: boolean
            submitSound: ig.Sound
            blockedSound: ig.Sound
            type: modmanager.gui.InputFieldType
            boundProcessInput: (this: Window, ev: KeyboardEvent) => any
            validChars: RegExp
            onCharacterInput: (value: string, key: string) => any
            dummyForClipping: sc.DummyContainer
            highlight: sc.ButtonHighlightGui
            textChild: sc.TextGui
            cursorTick: number
            cursorPos: number
            cursor: InputFieldCursor
            obscure: boolean
            obscureChar: string

            calculateCursorPos(this: this): number
            getValueAsString(this: this): string
            processInput(this: this, event: KeyboardEvent): void
            setTextChildText(this: this, text: string): void
            setText(this: this, text: string): void
            unsetFocus(this: this): void
            updateCursorPos(this: this, delta: number): void
            setObscure(this: this, obscure: boolean): void
        }

        interface InputFieldCon extends ImpactClass<InputField> {
            new (
                width: number,
                height: number,
                type?: modmanager.gui.InputFieldType,
                obscure?: boolean,
                obscureChar?: string
            ): InputField
        }

        let InputField: InputFieldCon
    }
}

modmanager.gui.InputField = ig.FocusGui.extend({
    gfx: new ig.Image('media/gui/buttons.png'),
    value: [],
    bg: null,
    focusTimer: 0,
    alphaTimer: 0,
    animateOnPress: false,
    noFocusOnPressed: false,
    submitSound: sc.BUTTON_SOUND.submit,
    blockedSound: sc.BUTTON_SOUND.denied,
    type: null,
    boundProcessInput: null,
    validChars: /[a-zA-Z0-9,! ]*/,
    cursorPos: 0,
    onCharacterInput: undefined,
    dummyForClipping: null,
    cursorTick: 0,
    cursor: undefined,
    obscure: false,
    obscureChar: '*',
    init(width: number, height: number, type?: modmanager.gui.InputFieldType, obscure?: boolean, obscureChar?: string) {
        this.parent(true)
        this.setSize(width, height)

        this.obscure = obscure || false
        this.obscureChar = obscureChar || '*'

        this.hook.clip = true

        this.type = type || modmanager.gui.INPUT_FIELD_TYPE.DEFAULT

        this.bg = new sc.ButtonBgGui(this.hook.size.x, this.type)
        this.bg.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP)
        this.bg.hook.size = this.hook.size
        this.addChildGui(this.bg)

        this.highlight = new sc.ButtonHighlightGui(this.hook.size.x, this.type)
        this.addChildGui(this.highlight)

        this.textChild = new sc.TextGui(this.value, {
            speed: ig.TextBlock.SPEED.IMMEDIATE,
        })

        this.textChild.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP)

        // #region dummy
        this.dummyForClipping = new sc.DummyContainer(this.textChild)
        this.dummyForClipping.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP)
        this.dummyForClipping.setPos(4, 1)
        this.dummyForClipping.setSize(width - 8, height)
        this.addChildGui(this.dummyForClipping)
        // #endregion

        // #region cursor
        this.cursor = new modmanager.gui.InputFieldCursor('#FF6D00')
        this.cursor.hook.pos.y = 2
        // Set initial cursor position.
        this.cursor.hook.pos.x = this.calculateCursorPos()
        this.addChildGui(this.cursor)
        // #endregion

        this.boundProcessInput = this.processInput.bind(this)
        this.validChars = /[a-zA-Z0-9,! ]*/
    },

    focusGained() {
        this.parent()
        ig.input.ignoreKeyboard = true
        for (const action of Object.keys(ig.input.actions) as ig.Input.KnownAction[]) ig.input.actions[action] = false
        this.cursor.active = true
        window.addEventListener('keydown', this.boundProcessInput, false)
    },

    focusLost() {
        this.parent()
        ig.input.ignoreKeyboard = false
        this.cursor.active = false
        window.removeEventListener('keydown', this.boundProcessInput)
    },

    processInput(event: KeyboardEvent) {
        event.preventDefault()
        switch (event.code) {
            case 'ArrowLeft':
                this.updateCursorPos(-1)
                break
            case 'ArrowRight':
                this.updateCursorPos(1)
                break
            case 'Home':
                this.cursorPos = 0
                break
            case 'End':
                this.cursorPos = this.value.length
                break
            default: {
                let old = this.getValueAsString()

                if (event.key.length === 1 && this.validChars.test(event.key)) {
                    this.value.splice(this.cursorPos, 0, event.key)
                    this.updateCursorPos(1)
                } else if (event.code === 'Backspace' && this.value.length > 0 && this.cursorPos !== 0) {
                    // Backspace
                    this.value.splice(this.cursorPos - 1, 1)
                    this.updateCursorPos(-1)
                } else if (event.code === 'Delete' && this.value.length > 0 && this.cursorPos !== this.value.length) {
                    this.value.splice(this.cursorPos, 1)
                }

                let text = this.getValueAsString()
                if (text !== old) {
                    this.setTextChildText(text)

                    if (this.onCharacterInput) {
                        this.onCharacterInput(text, event.key)
                    }
                }

                this.cursor.movingTimer = 1

                break
            }
        }

        this.cursor.hook.pos.x = this.calculateCursorPos()
    },

    setTextChildText(text: string) {
        if (this.obscure) {
            this.textChild.setText(this.obscureChar.repeat(this.value.length))
        } else {
            this.textChild.setText(text)
        }
    },

    setText(text: string) {
        this.setTextChildText(text)
        this.value = text.split('')
        this.cursorPos = text.length
        this.cursor.hook.pos.x = this.calculateCursorPos()
    },

    getValueAsString() {
        return this.value.join('')
    },

    updateCursorPos(delta) {
        this.cursorPos += delta
        this.cursorPos = Math.min(Math.max(this.cursorPos, 0), this.value.length)
    },

    calculateCursorPos() {
        let value = this.obscure
            ? this.obscureChar.repeat(this.cursorPos)
            : this.value.slice(0, this.cursorPos).join('')
        return this.textChild.textBlock.font.getTextDimensions(value, this.textChild.textBlock.linePadding).x / 2 + 1.5
    },

    setObscure(obscure) {
        this.obscure = obscure
        this.setTextChildText(this.getValueAsString())
    },

    // Liberated from ButtonGui
    update() {
        this.parent()

        if (this.keepPressed && this.pressed && this.animateOnPress) {
            // If this element is currently focussed
            if (this.focus) {
                this.alphaTimer = (this.alphaTimer + ig.system.actualTick) % 1
            } else {
                this.alphaTimer = 0
                this.focusTimer = 0.1
            }
        } else if (this.keepPressed && this.pressed && !this.noFocusOnPressed) {
            this.focusTimer = this.focusTimer + ig.system.actualTick
            if (this.focusTimer > 0.1) this.focusTimer = 0.1 // This line is made redundant by this.focusTimer.limit(0, 0.1);
            this.alphaTimer = 0
        } else if (this.focus && this.focusTimer < 0.1) {
            // If we are focussing and the focus timer is less than max, increase the focus timer
            this.focusTimer = this.focusTimer + ig.system.actualTick
            this.alphaTimer = 0
        } else if (!this.focus && this.focusTimer > 0) {
            // If we are no longer focussing, reduce the focus timer
            this.focusTimer = this.focusTimer - ig.system.actualTick
            this.alphaTimer = 0
        } else {
            this.alphaTimer = (this.alphaTimer + ig.system.actualTick) % 1
        }
        this.focusTimer.limit(0, 0.1)
        this.bg.currentTileOffset = this.keepPressed && this.pressed ? 'pressed' : this.focus ? 'focus' : 'default'
        if (this.highlight) {
            this.highlight.focusWeight = this.focusTimer / 0.1
            var a = this.alphaTimer / 1,
                a = KEY_SPLINES.EASE_IN_OUT.get(1 - (a > 0.5 ? 1 - (a - 0.5) * 2 : a * 2)),
                a = 0.8 * a + 0.2
            this.active || (a = a * 0.5)
            this.highlight.hook.localAlpha = a
        }
    },

    unsetFocus() {
        this.focus = false
        this.setPressed(false)
        if (this.highlight) {
            this.highlight.hook.localAlpha = 0
            this.highlight.focusWeight = 0
        }
        this.focusTimer = 0
        this.alphaTimer = 0
    },
})
