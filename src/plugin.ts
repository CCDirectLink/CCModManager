import { FileCache } from './cache'
import { LangManager } from './lang-manager'
import { ModInstaller } from './mod-installer'
import { ModDB } from './moddb'
import type { Mod1 } from './types'
import { Opts, registerOpts } from './options'
import { modOptionsPoststart, modOptionsPrestart } from './mod-options'
import { initLibraries } from './library-providers'
import { LocalMods } from './local-mods'
import { setModMetadata } from './mod-metadata'

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

let loadEverythingPromise: Promise<string[] | undefined> | undefined
export async function loadEverything(force?: boolean) {
    if (!force && loadEverythingPromise) return loadEverythingPromise

    const previousPromise = loadEverythingPromise

    loadEverythingPromise = (async () => {
        if (previousPromise) {
            try {
                await previousPromise
            } catch {}
        }
        return _loadEverything(force)
    })()

    return loadEverythingPromise
}
async function _loadEverything(force?: boolean) {
    const gui = modmanager.gui /* keep correct reference after await to fix behaviour cc-multibakery */
    LocalMods.init()

    ModDB.loadDatabases(force)
    let uncheckedDatabases: string[] | undefined
    if (isFullMode()) {
        uncheckedDatabases = await ModDB.loadAllMods(force)
        await LocalMods.initAfterDatabaseLoaded()
        ModDB.removeModDuplicatesAndResolveTesting(ModDB.modRecord)
    }

    gui.menu?.list?.reloadEntries()

    return uncheckedDatabases
}

export default class ModManager {
    private lang!: LangManager

    constructor(mod: Mod1) {
        setModMetadata(mod)
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

        await import('./gui/gui')

        sc.TitleScreenButtonGui.inject({
            show() {
                this.parent()
                if (isFullMode() && Opts.autoUpdate) {
                    loadEverything().then(() => {
                        ModInstaller.checkAllLocalModsForUpdate()
                    })
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
