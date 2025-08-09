import { GuiOption } from '../../../mod-options'

declare global {
    namespace modmanager.gui.Options {}
}

import './button-group'
import './button'
import './checkbox'
import './controls'
import './info'
import './input-field'
import './object-slider'

export interface ModOptionsOptionElement {
    guiOption: GuiOption

    getNameGuiInfo(this: this): { has: boolean }
}

export interface ModOptionsOptionConstructor<T extends ModOptionsOptionElement> {
    new (optionRow: modmanager.gui.OptionsOptionRow, width: number, rowGroup: sc.RowButtonGroup): T
}

export function optGet(guiOption: GuiOption): unknown {
    return modmanager.options[guiOption.modId][guiOption.baseId]
}
export function optSet(guiOption: GuiOption, value: any) {
    modmanager.options[guiOption.modId][guiOption.baseId] = value
}
