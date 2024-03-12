import { Mod } from 'ultimate-crosscode-typedefs/modloader/mod'
import { FileCache } from './cache'
import ModManager from './plugin'
import { ModEntryLocal, ModEntryServer } from './types'
import { ModDB } from './moddb'
import { ModInstaller } from './mod-installer'

type CCL2Mod = {
    baseDirectory: string
    dependencies?: Record<string, string>
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

    private static localModFlags: Record<string, { disableUninstall?: boolean; disableDisabling?: boolean; disableUpdate?: boolean }> = {
        ccloader: {
            disableDisabling: true,
            disableUninstall: true,
        },
        Simplify: {
            disableDisabling: true,
            disableUninstall: true,
            disableUpdate: true,
        },
        'CCLoader display version': {
            disableUninstall: true,
            disableUpdate: true,
        },
    }

    static isInited() {
        return !!this.cache
    }

    static async initAll() {
        let all: ModEntryLocal[]
        if (ModManager.mod.isCCL3) {
            all = [...modloader.installedMods].map(e => this.convertCCL3Mod(e[1]))
        } else {
            all = [...window.activeMods.map(this.convertCCL2Mod), ...window.inactiveMods.map(this.convertCCL2Mod)]
        }
        this.cache = all

        all.push(...(await this.createVirtualLocalMods()))

        this.cacheRecord = {}
        for (const mod of all) {
            this.cacheRecord[mod.id] = mod
        }
        for (const id in this.localModFlags) {
            const mod = this.cacheRecord[id]
            if (mod) ig.merge(mod, this.localModFlags[id])
        }

        await Promise.all([
            ...all.map(mod => ModDB.resolveLocalModOrigin(mod)),
            ...all.map(mod =>
                ModInstaller.isDirGit(mod.path).then(isGit => {
                    mod.isGit = isGit
                })
            ),
        ])

        for (const mod of all) {
            if (!mod.disableUpdate) mod.hasUpdate = ModInstaller.checkLocalModForUpdate(mod)
        }
    }

    static async refreshOrigin() {
        if (!this.isInited()) await this.initAll()
        return Promise.all(this.cache.map(mod => ModDB.resolveLocalModOrigin(mod)))
    }

    static getAll() {
        if (!this.cache) throw new Error('Local mods accessed before cached!')
        return this.cache
    }

    private static async createVirtualLocalMods(): Promise<ModEntryLocal[]> {
        const mods: ModEntryLocal[] = []
        const ccloader = await ModDB.getLocalModOrigin('ccloader')
        if (ccloader) mods.push(this.convertServerToLocal(ccloader, this.getCCLoaderVersion(), '', true))
        return mods
    }

    private static convertServerToLocal(
        server: ModEntryServer,
        version: string,
        path: string,
        active: boolean,
        iconConfig = FileCache.getDefaultModIconConfig()
    ): ModEntryLocal {
        return {
            database: 'LOCAL',
            isLocal: true,
            id: server.id,
            name: server.name,
            description: server.description,
            version,
            isLegacy: server.isLegacy,
            hasIcon: server.hasIcon,
            dependencies: server.dependencies,
            path,
            active,
            iconConfig,
            hasUpdate: false,
        }
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
        sc.options.set(`modEnabled-${mod.id.toLowerCase()}`, value)
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
            dependencies: mod.dependencies ?? {},
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
            hasUpdate: false,
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
            hasUpdate: false,
        }
    }

    static getCCVersion(): string {
        return ModManager.mod.isCCL3 ? modloader.gameVersion.raw : versions.crosscode
    }

    static getCCLoaderVersion(): string {
        return ModManager.mod.isCCL3 ? modloader.version.raw : versions.ccloader
    }

    static findDeps(mod: ModEntryLocal): ModEntryLocal[] {
        const localModsByName = LocalMods.getAll().reduce(
            (acc, v) => {
                acc[v.name] = v
                return acc
            },
            {} as Record<string, ModEntryLocal>
        )
        const localMods = LocalMods.cacheRecord
        function getModDep(str: string) {
            return localMods[str] ?? localModsByName[str]
        }

        const deps: Set<ModEntryLocal> = new Set()
        for (const depModName in mod.dependencies) {
            if (ModInstaller.virtualMods[depModName]) continue
            const depMod = getModDep(depModName)
            deps.add(depMod)
            for (const m of this.findDeps(depMod)) deps.add(m)
        }
        return [...deps]
    }
}
