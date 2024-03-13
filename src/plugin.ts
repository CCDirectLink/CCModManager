import { FileCache } from './cache'
import { LangManager } from './lang-manager'
import { ModInstaller } from './mod-installer'
import { ModDB } from './moddb'
import { Mod1 } from './types'

const autoupdateLocalStorageId = 'ccmodmanager-autoupdate'

export default class ModManager {
    static dir: string
    static mod: Mod1
    private lang!: LangManager

    constructor(mod: Mod1) {
        ModManager.dir = mod.baseDirectory
        ModManager.mod = mod
        ModManager.mod.isCCL3 = mod.findAllAssets ? true : false
        ModManager.mod.isCCModPacked = mod.baseDirectory.endsWith('.ccmod/')

        // @ts-expect-error
        window.sc ??= {}

        Object.defineProperty(sc, 'modManagerAutoUpdate', {
            set(v) {
                localStorage.setItem(autoupdateLocalStorageId, v.toString())
            },
            get() {
                return localStorage.getItem(autoupdateLocalStorageId) == 'true'
            },
        })
        if (localStorage.getItem(autoupdateLocalStorageId) === null) {
            sc.modManagerAutoUpdate = true
        }
    }

    async prestart() {
        FileCache.init()
        ModInstaller.init()
        this.lang = new LangManager()

        await import('./gui/gui.js')

        sc.TitleScreenButtonGui.inject({
            show() {
                this.parent()
                if (!ig.isdemo && sc.modManagerAutoUpdate) {
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
