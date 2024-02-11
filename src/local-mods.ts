import { Mod } from 'ultimate-crosscode-typedefs/modloader/mod'
import { FileCache } from './cache'
import ModManager from './plugin'
import { ModEntryLocal } from './types'
import { ModDB } from './moddb'

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
    /* ccl2 types only */
    var activeMods: CCL2Mod[]
    var inactiveMods: CCL2Mod[]
    var versions: { ccloader: string; crosscode: string }
}

export class LocalMods {
    private static cache: ModEntryLocal[]
    private static cacheRecord: Record<string, ModEntryLocal>

    static getAll(force: boolean = false) {
        if (!force && this.cache) return this.cache
        let all: ModEntryLocal[]
        if (ModManager.mod.isCCL3) {
            all = [...modloader.installedMods].map(e => this.convertCCL3Mod(e[1]))
        } else {
            all = this.cache = [...window.activeMods.map(this.convertCCL2Mod), ...window.inactiveMods.map(this.convertCCL2Mod)]
        }
        this.cacheRecord = {}
        for (const mod of all) {
            ModDB.resolveLocalModOrigin(mod)
            this.cacheRecord[mod.id] = mod
        }
        return all
    }

    static getAllRecord() {
        if (!this.cacheRecord) this.getAll()
        return this.cacheRecord
    }

    static getActive(): ModEntryLocal[] {
        return this.getAll().filter(mod => mod.active)
    }

    static getInactive(): ModEntryLocal[] {
        return this.getAll().filter(mod => !mod.active)
    }

    static setModActive(mod: ModEntryLocal, value: boolean) {
        sc.options.set(`modEnabled-${mod.id}`, value)
        mod.active = value
        sc.options.persistOptions()
    }

    private static convertCCL2Mod(mod: CCL2Mod): ModEntryLocal {
        return {
            database: 'LOCAL',
            isLocal: true,

            id: mod.name,
            name: mod.displayName || mod.name,
            description: mod.description,
            version: mod.version || 'Unknown',
            isLegacy: false /*duno how to check*/,
            hasIcon: !!mod.icons?.['24'],
            dependencies: mod.dependencies,
            path: mod.baseDirectory.substring(0, mod.baseDirectory.length - 1),

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

    private static convertCCL3Mod(mod: Mod): ModEntryLocal {
        const active = sc.options.get(`modEnabled-${mod.id}`) as boolean
        return {
            database: 'LOCAL',
            isLocal: true,

            id: mod.id,
            name: ig.LangLabel.getText(mod.manifest.title || mod.id),
            description: mod.manifest.description ? ig.LangLabel.getText(mod.manifest.description) : undefined,
            version: mod.version?.toString() || 'Unknown',
            isLegacy: mod.legacyMode,
            hasIcon: !!mod.manifest.icons?.['24'],
            dependencies: [...mod.dependencies].reduce((acc: Record<string, string>, v) => {
                acc[v[0]] = v[1].version.raw
                return acc
            }, {}),
            path: mod.baseDirectory.substring(0, mod.baseDirectory.length - 1),

            active,
            iconConfig: mod.manifest.icons?.['24']
                ? {
                      path: `/${mod.baseDirectory}/${mod.manifest.icons['24']}`,
                      offsetX: 0,
                      offsetY: 0,
                      sizeX: 24,
                      sizeY: 24,
                  }
                : FileCache.getDefaultModIconConfig(),
        }
    }

    static getCCVersion(): string {
        return ModManager.mod.isCCL3 ? modloader.gameVersion.raw : versions.crosscode
    }

    static getCCLoaderVersion(): string {
        return ModManager.mod.isCCL3 ? modloader.version.raw : versions.ccloader
    }
}
