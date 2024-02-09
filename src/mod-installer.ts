import { LocalMods } from './local-mods'
import { ModDB } from './moddb'
import { ModEntry, ModEntryServer } from './types'

const fs: typeof import('fs') = (0, eval)("require('fs')")
const path: typeof import('path') = (0, eval)("require('path')")

import { loadAsync } from 'jszip'
import semver from 'semver'

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

    static getModByDepName(depName: string): ModEntryServer | undefined {
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
            const dep = this.getModByDepName(depName)
            if (!dep) throw new Error(`Mod: ${mod.id} has a dependency missing: ${depName}`)

            const reqVersionRange = mod.dependencies[depName]
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
            if (!semver.satisfies(mod.version, range)) return false
        }
        return true
    }

    static async findDeps(modRecords: Record<string, ModEntryServer[]>) {
        this.record = ModDB.removeModDuplicates(modRecords)
        this.byNameRecord = {}
        for (const modId in this.record) {
            const mod = this.record[modId]
            this.byNameRecord[mod.name] = mod
        }

        const mods = InstallQueue.values()
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
            const localMod = LocalMods.getAllRecord()[modId]
            if (localMod) {
                if (this.matchesVersionReqRanges(localMod, versionReqRanges)) {
                    delete deps[modId]
                } else {
                    toUpdate.add(serverMod)
                }
            }
        }
        /* check if dependency versions are in the database */
        for (const modId in deps) {
            const { mod: serverMod, versionReqRanges } = deps[modId]
            if (!this.matchesVersionReqRanges(serverMod, versionReqRanges))
                throw new Error(
                    `Dependency: ${serverMod.id} that cannot be resolved: version range: ${versionReqRanges} was not met. Database has only: ${serverMod.version}`
                )
        }

        InstallQueue.deps = Object.values(deps).map(e => e.mod)
        sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.READY_TO_INSTALL)
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

        if (installation.type == 'modZip' || installation.type == 'ccmod') {
            const resp = await fetch(installation.url)
            const data = await resp.arrayBuffer()
            /* todo: add sha256 verfication */

            switch (installation.type) {
                case 'ccmod':
                    return await this.installCCMod(data, mod.id)
                case 'modZip':
                    return await this.installModZip(data, mod.id, installation.source)
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
}
