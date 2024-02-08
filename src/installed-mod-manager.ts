import { FileCache } from './cache'
import ModManager from './plugin'
import { ModEntryLocal } from './types'

type CCL2Mod = {
    baseDirectory: string
    dependencies: Record<string, string>
    disabled: boolean
    name: string
    displayName?: string
    description?: string
    version: string
    icons?: { '24'?: string }

    active?: boolean
}
declare global {
    var activeMods: CCL2Mod[]
    var inactiveMods: CCL2Mod[]
}

/* TODO: Add caching */
export class InstalledMods {
    private static cache: ModEntryLocal[]

    static getAll() {
        if (this.cache) return this.cache
        if (ModManager.mod.isCCL3) {
            throw new Error('ccl3 not yet supported')
        } else {
            return (this.cache = [...window.activeMods.map(this.convertCCL2Mod), ...window.inactiveMods.map(this.convertCCL2Mod)])
        }
    }

    static getActive(): ModEntryLocal[] {
        return this.getAll().filter(mod => mod.active)
    }

    static getInactive(): ModEntryLocal[] {
        return this.getAll().filter(mod => !mod.active)
    }

    static setModActive(mod: ModEntryLocal, value: boolean) {
        if (ModManager.mod.isCCL3) {
            throw new Error('ccl3 not yet supported')
        } else {
            sc.options.set(`modEnabled-${mod.id}`, value)
            mod.active = value
            // this.cache.find(m => m.id == mod.id)!.active = mod.avalue
        }
    }

    private static convertCCL2Mod(mod: CCL2Mod): ModEntryLocal {
        return {
            database: 'LOCAL',
            isLocal: true,

            id: mod.name,
            name: mod.displayName || mod.name,
            description: mod.description,
            version: mod.version,
            isLegacy: false /*todo*/,
            hasIcon: !!mod.icons?.['24'],

            active: !mod.disabled,
            iconConfig: mod.icons?.['24']
                ? {
                      path: `/${mod.baseDirectory}/${mod.icons['24']}`,
                      offsetX: 0,
                      offsetY: 0,
                      sizeX: 24,
                      sizeY: 24,
                  }
                : FileCache.getDefaultModIconConfig(),
        }
    }
}
