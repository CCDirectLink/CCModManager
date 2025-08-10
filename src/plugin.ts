import { FileCache } from './cache'
import { LangManager } from './lang-manager'
import { ModInstaller } from './mod-installer'
import { ModDB } from './moddb'
import { Mod1 } from './types'
import { Opts, registerOpts } from './options'
import { modOptionsPoststart, modOptionsPrestart } from './mod-options'
import { initLibraries } from './library-providers'

import type {} from 'crosscode-demonizer/src/demomod/types.d.ts'
import './mod-options'

export function isFullMode() {
    return !ig.isdemo && ig.platform == ig.PLATFORM_TYPES.DESKTOP
}
export function openLink(url: string) {
    if (ig.platform == ig.PLATFORM_TYPES.DESKTOP) {
        nw.Shell.openExternal(url)
    } else {
        window.open(url, '_blank')?.focus()
    }
}

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
        initLibraries()
        this.lang = new LangManager()
        registerOpts()

        // set the repos to the official ones when updating v0.9.22 -> v1.0.0
        if (Opts.repositories.includes('@krypciak/CCModDB/stable')) {
            Opts.repositories = Opts.flatOpts.repositories.init
        }

        FileCache.init()
        ModInstaller.init()

        await import('./gui/gui.js')

        sc.TitleScreenButtonGui.inject({
            show() {
                this.parent()
                if (isFullMode() && Opts.autoUpdate) {
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
    }
}
