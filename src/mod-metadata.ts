import type { Mod1 } from './types'
import ccmod from '../ccmod.json'

interface ModMetadata {
    manifest: typeof ccmod
    dir: string
    isCCModPacked: boolean
    mod: Mod1
}
export let modMetadata!: ModMetadata
export function setModMetadata(mod: Mod1) {
    modMetadata = {
        manifest: ccmod,
        dir: mod.baseDirectory,
        isCCModPacked: mod.baseDirectory.endsWith('.ccmod/'),
        mod,
    }
    mod.isCCL3 = mod.findAllAssets ? true : false
    if (!mod.isCCL3) Object.assign(mod, { id: mod.name })
}
