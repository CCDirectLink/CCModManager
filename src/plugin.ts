import { FileCache } from './cache'
import { LangManager } from './lang-manager'
import { ModInstaller } from './mod-installer'
import { ModDB } from './moddb'
import { Mod1 } from './types'

import type * as _ from 'crosscode-demonizer/src/demomod/types.d.ts'

import './mod-options'

import { Opts, registerOpts } from './options'
import { modOptionsPoststart, modOptionsPrestart } from './mod-options'

export default class ModManager {
    static dir: string
    static mod: Mod1
    private lang!: LangManager

    constructor(mod: Mod1) {
        ModManager.dir = mod.baseDirectory
        ModManager.mod = mod
        ModManager.mod.isCCL3 = mod.findAllAssets ? true : false
        ModManager.mod.isCCModPacked = mod.baseDirectory.endsWith('.ccmod/')
    }

    async prestart() {
        this.lang = new LangManager()
        registerOpts()
        FileCache.init()
        ModInstaller.init()

        await import('./gui/gui.js')

        sc.TitleScreenButtonGui.inject({
            show() {
                this.parent()
                if (!ig.isdemo && Opts.autoUpdate) {
                    ModDB.loadDatabases()
                    ModInstaller.checkAllLocalModsForUpdate()
                }
            },
        })
        modOptionsPrestart()
    }

    async poststart() {
        modOptionsPoststart()
        this.lang.poststart()

        if (!window.nax?.ccuilib?.InputField) {
            // @ts-expect-error
            window.nax ??= {}
            // @ts-expect-error
            window.nax.ccuilib ??= {}
            // @ts-expect-error
            await import('nax-ccuilib/src/ui/input-field-cursor.js')
            // @ts-expect-error
            await import('nax-ccuilib/src/ui/input-field.js')
        }
    }
}
