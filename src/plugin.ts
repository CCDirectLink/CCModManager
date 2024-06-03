import { FileCache } from './cache'
import { LangManager } from './lang-manager'
import { ModInstaller } from './mod-installer'
import { ModDB } from './moddb'
import { Mod1 } from './types'

import type * as _ from 'crosscode-demonizer/src/demomod/types.d.ts'
import './add-prototypes'

import './mod-options'

import { Opts, registerOpts } from './options'

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
    }

    async poststart() {
        this.lang.poststart()
    }
}
