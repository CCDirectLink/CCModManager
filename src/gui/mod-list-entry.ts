import type { ModEntry, ModEntryLocal } from '../types'
import { ModDB } from '../moddb'
import { LocalMods } from '../local-mods'
import { InstallQueue } from '../mod-installer'
import { prepareModName } from '../misc-functions'
import { FileCache } from '../cache'
import type { Color } from './colors'

import './list-entry'

declare global {
    namespace modmanager.gui {
        interface ModListEntry extends modmanager.gui.ListEntry {
            mod: ModEntry

            tryDisableMod(this: this, mod: ModEntryLocal): string | undefined
            tryEnableMod(this: this, mod: ModEntryLocal): string | undefined
            toggleSelection(this: this, force?: boolean): string | undefined
        }
        interface ModListEntryConstructor extends ImpactClass<ModListEntry> {
            new (mod: ModEntry, modList: modmanager.gui.MenuList): ModListEntry
        }
        var ModListEntry: ModListEntryConstructor
    }
}
modmanager.gui.ModListEntry = modmanager.gui.ListEntry.extend({
    init(mod, modList) {
        this.mod = mod

        if (!mod.isLocal && mod.testingVersion && ModDB.isModTestingOptIn(mod.id)) {
            mod = mod.testingVersion
        }

        this.parent(mod, modList)

        const localMod = this.mod.isLocal ? this.mod : this.mod.localCounterpart

        if (this.modList.currentTabIndex == modmanager.gui.MOD_MENU_TAB_INDEXES.DISABLED) this.setNameText('RED')
        else if (this.modList.currentTabIndex == modmanager.gui.MOD_MENU_TAB_INDEXES.ENABLED) this.setNameText('GREEN')
        else {
            if (localMod) {
                if (localMod.active) this.setNameText('GREEN')
                else this.setNameText('RED')
            }
        }
        if (InstallQueue.has(this.mod)) this.setNameText('YELLOW')
    },
    getIcon() {
        return FileCache.getIconConfig(this.mod)
    },
    getName() {
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

        const serverMod = this.mod.isLocal ? this.mod.serverCounterpart : this.mod
        if (serverMod?.testingVersion) {
            icon += `\\i[ccmodmanager-testing-${ModDB.isModTestingOptIn(serverMod.id) ? 'on' : 'off'}]`
        }

        return { icon, text: prepareModName(this.mod) }
    },

    onButtonPress() {
        if (this.mod.isLocal) {
            if (
                this.modList.currentTabIndex == modmanager.gui.MOD_MENU_TAB_INDEXES.ENABLED ||
                this.modList.currentTabIndex == modmanager.gui.MOD_MENU_TAB_INDEXES.DISABLED
            ) {
                if (this.mod.active) return this.tryDisableMod(this.mod)
                else return this.tryEnableMod(this.mod)
            } else if (this.modList.currentTabIndex == modmanager.gui.MOD_MENU_TAB_INDEXES.SETTINGS) {
                modmanager.gui.menu.modOptionsButton.onButtonPress()
            } else {
                throw new Error('wat?')
            }
        } else if (this.mod.localCounterpart) {
            return this.toggleSelection()
        } else {
            if (InstallQueue.has(this.mod)) {
                InstallQueue.delete(this.mod)
                sc.BUTTON_SOUND.toggle_off.play()
                this.setNameText('WHITE')
                return 'Un-Selected'
            } else {
                InstallQueue.add(this.mod)
                sc.BUTTON_SOUND.toggle_on.play()
                this.setNameText('YELLOW')
                return 'Selected'
            }
        }
    },

    toggleSelection(force = false) {
        if (this.mod.isLocal) return
        const localMod = this.mod.localCounterpart
        if (!localMod) return
        if ((force || localMod.hasUpdate) && !localMod.isGit) {
            if (InstallQueue.has(this.mod)) {
                if (localMod.active) this.setNameText('GREEN')
                else this.setNameText('RED')
                sc.BUTTON_SOUND.toggle_off.play()
                InstallQueue.delete(this.mod)
                this.updateHighlightWidth()
                return 'Un-selected'
            } else {
                this.setNameText('YELLOW')
                sc.BUTTON_SOUND.toggle_on.play()
                InstallQueue.add(this.mod)
                this.updateHighlightWidth()
                return 'Selected'
            }
        } else sc.BUTTON_SOUND.denied.play()
    },

    tryEnableMod(mod: ModEntryLocal) {
        modmanager.gui.ModInstallDialogs.showEnableModDialog(mod).then(() => {
            this.updateHighlightWidth()
        })
        return 'Enabled'
    },

    tryDisableMod(mod: ModEntryLocal) {
        if (!modmanager.gui.ModInstallDialogs.checkCanDisableMod(mod)) {
            sc.BUTTON_SOUND.denied.play()
            return
        }
        mod.awaitingRestart = !mod.awaitingRestart
        this.setNameText('RED')
        sc.BUTTON_SOUND.toggle_off.play()
        LocalMods.setModActive(mod, false)
        this.updateHighlightWidth()
        return 'Disabled'
    },

    modelChanged(model, message: modmanager.gui.MENU_MESSAGES, data) {
        this.parent(model, message, data)

        const d = data as { mod: ModEntryLocal; color: Color }
        if (
            model == modmanager.gui.menu &&
            message == modmanager.gui.MENU_MESSAGES.ENTRY_UPDATE_COLOR &&
            d.mod == this.mod
        ) {
            this.setNameText(d.color)
        }
    },
})
