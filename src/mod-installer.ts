import { LocalMods } from './local-mods'
import { ModDB } from './moddb'
import { ModEntry, ModEntryLocal, ModEntryServer } from './types'

const fs: typeof import('fs') = (0, eval)("require('fs')")
const path: typeof import('path') = (0, eval)("require('path')")

import { loadAsync } from 'jszip'
import semver_satisfies from 'semver/functions/satisfies'
import { rimraf } from '../node_modules/rimraf/dist/commonjs/index.js'

export class InstallQueue {
    private static queue: Set<ModEntryServer> = new Set()
    static deps: ModEntryServer[]

    private static changeUpdate() {
        sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.SELECTED_ENTRIES_CHANGED)
    }
    static add(...mods: ModEntryServer[]) {
        for (const mod of mods) this.queue.add(mod)
        this.changeUpdate()
    }
    static delete(mod: ModEntryServer) {
        this.queue.delete(mod)
        this.changeUpdate()
    }
    static clear() {
        this.queue.clear()
        this.changeUpdate()
    }
    static has(mod: ModEntry) {
        return this.queue.has(mod as ModEntryServer)
    }
    static values(): ModEntryServer[] {
        return [...this.queue]
    }
}

type DepEntry = { mod: ModEntryServer; versionReqRanges: string[] }

export class ModInstaller {
    static record: Record<string, ModEntryServer>
    static byNameRecord: Record<string, ModEntryServer>
    private static virtualMods: Record<string, ModEntryLocal> = {
        crosscode: {
            id: 'crosscode',
            name: 'CrossCode',
            description: 'The base game.',
            version: LocalMods.getCCVersion(),
        } as ModEntryLocal,
        ccloader: {
            id: 'ccloader',
            name: 'CCLoader',
            description: 'The mod loader.',
            version: LocalMods.getCCLoaderVersion(),
        } as ModEntryLocal,
    }

    private static getModByDepName(depName: string): ModEntryServer | undefined {
        return this.record[depName] || this.byNameRecord[depName]
    }

    private static setOrAddNewer(record: Record<string, DepEntry>, mod: ModEntryServer, ...reqVersionRange: string[]) {
        const entry = record[mod.id]
        if (!entry) {
            record[mod.id] = { mod, versionReqRanges: reqVersionRange }
        } else {
            entry.versionReqRanges.push(...reqVersionRange)
        }
    }

    static getModDependencies(mod: ModEntryServer): Record<string, DepEntry> {
        if (mod.dependenciesCached) return mod.dependenciesCached
        const deps: Record<string, DepEntry> = {}
        for (const depName in mod.dependencies) {
            const reqVersionRange = mod.dependencies[depName]
            if (this.virtualMods[depName]) {
                this.setOrAddNewer(deps, { id: depName } as any, reqVersionRange)
                continue
            }
            const dep = this.getModByDepName(depName)

            if (!dep) throw new Error(`Mod: ${mod.id} has a dependency missing: ${depName}`)

            this.setOrAddNewer(deps, dep, reqVersionRange)

            const depDeps = this.getModDependencies(dep)
            for (const depDepName in depDeps) {
                const depDep = depDeps[depDepName]
                this.setOrAddNewer(deps, depDep.mod, ...depDep.versionReqRanges)
            }
        }
        return deps
    }

    private static matchesVersionReqRanges(mod: ModEntry, versionReqRanges: string[]) {
        for (const range of versionReqRanges) {
            if (!semver_satisfies(mod.version, range)) return false
        }
        return true
    }

    static async findDeps(mods: ModEntryServer[], modRecords: Record<string, ModEntryServer[]>) {
        this.record = ModDB.removeModDuplicates(modRecords)
        this.byNameRecord = {}
        for (const modId in this.record) {
            const mod = this.record[modId]
            this.byNameRecord[mod.name] = mod
        }

        const deps: Record<string, DepEntry> = {}
        for (const mod of mods) {
            const modDeps = this.getModDependencies(mod)
            for (const modId in modDeps) {
                const entry = modDeps[modId]
                this.setOrAddNewer(deps, entry.mod, ...entry.versionReqRanges)
            }
        }

        /* filter already installed mods */
        const toUpdate = new Set<ModEntryServer>()
        for (const modId in deps) {
            const { mod: serverMod, versionReqRanges } = deps[modId]
            const localMod = serverMod.localCounterpart
            if (localMod) {
                if (this.matchesVersionReqRanges(localMod, versionReqRanges)) {
                    delete deps[modId]
                } else {
                    toUpdate.add(serverMod)
                }
            }
        }
        /* check if dependency versions are in the database */
        for (const virtualModId in this.virtualMods) {
            const dep = deps[virtualModId]
            if (!dep) continue
            const virtualMod = this.virtualMods[virtualModId]

            if (!this.matchesVersionReqRanges(virtualMod, dep.versionReqRanges)) {
                throw new Error(`${virtualMod.name} version does not meat the requirement: ${dep.versionReqRanges.join(', ')}`)
            }
            delete deps[virtualModId]
        }
        for (const modId in deps) {
            const { mod: serverMod, versionReqRanges } = deps[modId]
            if (!this.matchesVersionReqRanges(serverMod, versionReqRanges))
                throw new Error(
                    `Dependency: ${serverMod.name} (${serverMod.id}) that cannot be resolved: version range: ${versionReqRanges.join(', ')} was not met. Database has only: ${serverMod.version}`
                )
        }

        InstallQueue.deps = Object.values(deps).map(e => e.mod)
    }

    static async install(modsToInstall: ModEntryServer[]) {
        console.log('mods to install:', modsToInstall.map(mod => mod.id).join(', '))
        const promises: Promise<void>[] = []
        for (const mod of modsToInstall) {
            promises.push(this.downloadAndInstallMod(mod))
        }
        await Promise.all(promises)
        console.log('done')
    }

    private static async downloadAndInstallMod(mod: ModEntryServer) {
        console.log('installing mod:', mod.id)

        const installation = mod.installation.find(i => i.type === 'ccmod') || mod.installation.find(i => i.type === 'modZip')
        if (!installation) throw new Error(`Mod: ${mod.id} has no known installation methods.`)

        const modId = mod.id.replace(/ /g, '_')
        if (installation.type == 'modZip' || installation.type == 'ccmod') {
            const resp = await fetch(installation.url)
            const data = await resp.arrayBuffer()
            /* todo: add sha256 verfication */

            switch (installation.type) {
                case 'ccmod':
                    return await this.installCCMod(data, modId)
                case 'modZip':
                    return await this.installModZip(data, modId, installation.source)
            }
        }
    }

    private static async installCCMod(data: ArrayBuffer, id: string) {
        return fs.promises.writeFile(`assets/mods/${id}.ccmod`, new Uint8Array(data))
    }

    private static async installModZip(data: ArrayBuffer, id: string, source: string) {
        const zip = await loadAsync(data)

        await Promise.all(
            Object.values(zip.files)
                .filter(file => !file.dir)
                .map(async file => {
                    const data = await file.async('uint8array')
                    const relative = path.relative(source, file.name)
                    if (relative.startsWith('..' + path.sep)) {
                        return
                    }

                    const filepath = path.join('assets/mods/', id, relative)
                    try {
                        await fs.promises.mkdir(path.dirname(filepath), { recursive: true })
                    } catch {}
                    await fs.promises.writeFile(filepath, data)
                })
        )
    }

    static getWhatDependsOnAMod(mod: ModEntryLocal): ModEntryLocal[] {
        const list: ModEntryLocal[] = []
        for (const otherMod of LocalMods.getAll()) {
            const deps = otherMod.dependencies
            if (deps[mod.id] || deps[mod.name]) list.push(otherMod)
        }
        return list
    }

    static async uninstallMod(mod: ModEntryLocal) {
        console.log('uninstall', mod.id)
        return rimraf.rimraf(mod.path)
    }

    static restartGame() {
        if ('chrome' in window) (window.chrome as any).runtime.reload()
        else window.location.reload()
    }
}
