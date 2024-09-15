export function registerModManagerIcons() {
    const iconsFont = new ig.Font('media/font/ccmodmanager-icons.png', 16, 16)
    const page = sc.fontsystem.font.iconSets.length
    sc.fontsystem.font.pushIconSet(iconsFont)
    const icons = [
        'ccmodmanager-git',
        'mod-icon',
        'mod-icon-online',
        'mod-icon-selected',
        'mod-icon-enabled',
        'mod-icon-disabled',
        'ccmodmanager-testing-off',
        'ccmodmanager-testing-on',
        'mod-icon-settings',
    ] as const
    const mapping: Record<string, [number, number]> = {}
    for (let i = 0; i < icons.length; i++) {
        mapping[icons[i]] = [page, i]
    }
    sc.fontsystem.font.setMapping(mapping)
}

/* what the hell */
export function registerDynamicIcons() {
    const kMy: Record<string, string> = {
        rightClickOrR2: 'gamepad-r2',
        shiftOrL2: 'gamepad-l2',
    }
    /** the current gamepad icon name to icon config */
    let j: ig.MultiFont.Mapping
    /** the current gamepad action to icon config */
    let l: ig.MultiFont.Mapping
    /** the k&m icons */
    let g: ig.MultiFont.Mapping

    let captureJ: boolean = false
    let captureL: boolean = false

    ig.MultiFont.inject({
        setMapping(mapping) {
            /* capture the local g variable */
            if (!g && mapping?.left && mapping.left[0] == 1 && mapping.left[1] == 0) {
                g = mapping
                mapping['rightClickOrR2'] = [1, 6]
                mapping['shiftOrL2'] = [1, 44]
            } else if (captureJ) {
                j = mapping
                captureJ = false
            } else if (captureL) {
                l = mapping
                captureL = false
            }
            this.parent(mapping)
        },
    })

    sc.FontSystem.inject({
        updateGamepadSwapMap() {
            this.parent()

            /* here a is j */
            const a = j //this.gamepadIconStyle ? i : h
            if (!a || !l) return
            for (const key in kMy) {
                l[key] = a[kMy[key]]
            }
        },
        changeGamepadIcon(action, icon) {
            if (kMy[action]) kMy[action] = icon

            captureJ = true
            if (this.gamepadIcons) captureL = true
            this.parent(action, icon)
        },
    })

    sc.OptionModel.inject({
        init() {
            this.parent()

            /* trigger l capturing */
            sc.options = this
            sc.fontsystem.gamepadIcons = true
            this.keyBinder.updateGamepadIcons()
            sc.fontsystem.gamepadIcons = false
        },
    })
}
