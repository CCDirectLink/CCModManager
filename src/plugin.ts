import {FileCache} from './cache'
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
        await import('./gui/gui.js')
    }

    async poststart() {}
}
