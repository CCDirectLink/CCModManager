import { FileCache } from './cache'
import { ModInstaller } from './mod-installer'
import { ModDB } from './moddb'
import { Mod1 } from './types'

export default class ModManager {
    static dir: string
    static mod: Mod1

    constructor(mod: Mod1) {
        ModManager.dir = mod.baseDirectory
        ModManager.mod = mod
        ModManager.mod.isCCL3 = mod.findAllAssets ? true : false
        ModManager.mod.isCCModPacked = mod.baseDirectory.endsWith('.ccmod/')
    }

    async prestart() {
        FileCache.init()
        ModInstaller.init()
        await import('./gui/gui.js')

        sc.TitleScreenButtonGui.inject({
            show() {
                this.parent()
                const autoUpdate = true
                if (autoUpdate) {
                    ModDB.loadDatabases()
                    ModInstaller.checkAllLocalModsForUpdate()
                }
            },
        })
    }

    async poststart() {}
}
