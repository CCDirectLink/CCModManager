import { LocalMods } from './local-mods'
import { ModDB } from './moddb'
import { ModEntry, ModEntryLocal, ModEntryServer } from './types'
import { ModInstallDialogs } from './gui/install-dialogs'

const fs: typeof import('fs') = (0, eval)("require('fs')")
const path: typeof import('path') = (0, eval)("require('path')")
const crypto: typeof import('crypto') = (0, eval)('require("crypto")')

import { loadAsync } from 'jszip'
import semver_satisfies from 'semver/functions/satisfies'
import semver_gt from 'semver/functions/gt'

// @ts-expect-error
import rimraf from 'rimraf'

export class InstallQueue {
    private static queue: ModEntryServer[] = []

    static changeUpdate() {
        sc.modMenu && sc.Model.notifyObserver(sc.modMenu, sc.MOD_MENU_MESSAGES.SELECTED_ENTRIES_CHANGED)
    }
    static add(...mods: ModEntryServer[]) {
        for (const mod of mods) {
            if (!this.has(mod)) this.queue.push(mod)
        }
        this.changeUpdate()
    }
    static delete(mod: ModEntryServer) {
        this.queue.erase(mod)
        this.changeUpdate()
    }
    static clear() {
        this.queue.splice(0, 1000000)
        this.changeUpdate()
    }
    static has(mod: ModEntry) {
        return this.queue.find(m => m.id == mod.id)
    }
    static values(): ModEntryServer[] {
        return [...this.queue]
    }
}

type DepEntry = { mod: ModEntryServer; versionReqRanges: string[] }

export class ModInstaller {
    static record: Record<string, ModEntryServer>
    static byNameRecord: Record<string, ModEntryServer>
    static virtualMods: Record<string, ModEntryLocal>

    static init() {
        this.virtualMods = {
            crosscode: {
                id: 'crosscode',
                name: 'CrossCode',
                description: 'The base game.',
                version: LocalMods.getCCVersion(),
            } as ModEntryLocal,
            'post-game': {
                id: 'post-game',
                name: 'DLC',
                description: 'CrossCode DLC.',
                version: LocalMods.getCCVersion(),
            } as ModEntryLocal,
        }
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

    private static getModDependencies(mod: ModEntryServer): Record<string, DepEntry> {
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

    static async findDepsDatabase(mods: ModEntryServer[], modRecords: Record<string, ModEntryServer[]>, includeInstalled: boolean = false): Promise<ModEntryServer[]> {
        /* resolve local mod origin */
        LocalMods.initAll()

        this.record = ModDB.removeModDuplicates(modRecords)
        this.byNameRecord = {}
        for (const modId in this.record) {
            const mod = this.record[modId]
            this.byNameRecord[mod.name] = mod
        }

        const deps: Record<string, DepEntry> = {}
        for (const mod of mods) {
            mod.installStatus = 'new' /* set default */
            try {
                const modDeps = this.getModDependencies(mod)
                for (const modId in modDeps) {
                    const entry = modDeps[modId]
                    this.setOrAddNewer(deps, entry.mod, ...entry.versionReqRanges)
                    entry.mod.installStatus = 'dependency'
                }
            } catch (err) {
                console.warn(`Mod Manager: ${(err as Error).message}`)
            }
        }
        if (!includeInstalled) {
            /* filter already installed mods */
            for (const modId in deps) {
                const { mod: serverMod, versionReqRanges } = deps[modId]
                const localMod = serverMod.localCounterpart
                if (localMod) {
                    if (this.matchesVersionReqRanges(localMod, versionReqRanges)) {
                        delete deps[modId]
                    } else {
                        serverMod.installStatus = 'update'
                    }
                }
            }
        }
        /* check virtual mod versions and remove them */
        for (const virtualModId in this.virtualMods) {
            const dep = deps[virtualModId]
            if (!dep) continue
            const virtualMod = this.virtualMods[virtualModId]

            if (!this.matchesVersionReqRanges(virtualMod, dep.versionReqRanges)) {
                throw new Error(`${virtualMod.name} version does not meat the requirement: ${dep.versionReqRanges.join(', ')}`)
            }
            delete deps[virtualModId]
        }
        if (!includeInstalled) {
            /* check if dependency versions are in the database */
            for (const modId in deps) {
                const { mod: serverMod, versionReqRanges } = deps[modId]
                if (!this.matchesVersionReqRanges(serverMod, versionReqRanges))
                    throw new Error(
                        `Dependency: ${serverMod.name} (${serverMod.id}) that cannot be resolved: version range: ${versionReqRanges.join(', ')} was not met. Database has only: ${serverMod.version}`
                    )
            }
        }

        const depMods = Object.values(deps).map(e => e.mod)
        for (const mod of [...depMods, ...mods]) {
            if (mod.localCounterpart?.hasUpdate) mod.installStatus = 'update'
        }
        return depMods
    }

    static async install(mods: ModEntryServer[]) {
        console.log('mods to install:', mods.map(mod => mod.id).join(', '))

        const modsToInstall: ModEntryServer[] = mods.filter(mod => mod.installStatus == 'new' || mod.installStatus == 'dependency')
        const promises: Promise<void>[] = []
        for (const mod of modsToInstall) {
            promises.push(this.downloadAndInstallMod(mod))
        }
        const modsToUpdate: ModEntryServer[] = mods.filter(mod => mod.installStatus == 'update')

        for (const mod of modsToUpdate) {
            promises.push(this.updateMod(mod))
        }
        await Promise.all(promises)
        console.log('done')
    }

    private static async updateMod(mod: ModEntryServer) {
        const local = mod.localCounterpart
        if (!local) throw new Error('wat')

        if (local.id == 'ccloader') {
            this.installCCLoader(mod)
            return
        }
        this.uninstallMod(local)
        this.downloadAndInstallMod(mod)
    }

    private static async downloadAndInstallMod(mod: ModEntryServer) {
        console.log('installing mod:', mod.id)

        const installation = mod.installation.find(i => i.type === 'zip')
        if (!installation) throw new Error(`Mod: ${mod.id} has no known installation methods.`)

        const modId = mod.id.replace(/ /g, '_')
        if (installation.type == 'zip') {
            const resp = await fetch(installation.url)
            const data = await resp.arrayBuffer()
            if (!this.checkSHA256(data, installation.hash.sha256))
                throw new Error(`Mod: ${mod.id} sha256 digest mismatch. Contact mod developers in the modding discord.`)

            if (installation.url.endsWith('.ccmod')) {
                return await this.installCCMod(data, modId)
            } else {
                return await this.installModZip(data, modId, installation.source)
            }
        }
    }

    private static async installCCMod(data: ArrayBuffer, id: string) {
        return fs.promises.writeFile(`assets/mods/${id}.ccmod`, new Uint8Array(data))
    }

    private static checkSHA256(data: ArrayBuffer, extected: string): boolean {
        const hash = crypto.createHash('sha256')
        hash.update(Buffer.from(data))
        const result = hash.digest('hex')
        return result == extected
    }

    private static async installModZip(data: ArrayBuffer, id: string, source: string, prefixPath: string = 'assets/mods') {
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

                    const filepath = path.join(prefixPath, id, relative)
                    console.log(filepath)
                    try {
                        await fs.promises.mkdir(path.dirname(filepath), { recursive: true })
                    } catch {}
                    await fs.promises.writeFile(filepath, data)
                })
        )
    }

    private static async installCCLoader(mod: ModEntryServer) {
        const installation = mod.installation.find(i => i.type === 'zip')
        if (!installation) throw new Error(`ccloader installation missing how???`)
        const resp = await fetch(installation.url)
        const data = await resp.arrayBuffer()
        this.installModZip(data, '', installation.source, '')
    }

    private static async fileExists(filePath: string) {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK)
            return true
        } catch (_) {
            return false
        }
    }

    static async isDirGit(dirPath: string): Promise<boolean> {
        if (!dirPath.trim()) return false
        const stat = await fs.promises.stat(dirPath)
        if (!stat.isDirectory()) return false
        return await this.fileExists(path.join(dirPath, '.git'))
    }

    static getWhatDependsOnAMod(mod: ModEntryLocal, on = false): ModEntryLocal[] {
        const list: ModEntryLocal[] = []
        for (const otherMod of on ? LocalMods.getActive() : LocalMods.getAll()) {
            const deps = otherMod.dependencies
            if (deps[mod.id] || deps[mod.name]) list.push(otherMod)
        }
        return list
    }

    static async uninstallMod(mod: ModEntryLocal) {
        if (mod.disableUninstall) throw new Error('Attempted to uninstall mod that has uninstalling disabled!')
        if (mod.isGit) throw new Error('Attempted to uninstall mod that is git!')
        console.log('uninstall', mod.id)
        return new Promise<void>(resolve => rimraf(mod.path, fs, () => resolve()))
    }

    static restartGame() {
        sc.options?.get('crashmsg-reload') || !('chrome' in window) ? window.location.reload() : (window.chrome as any).runtime.reload()
    }

    static checkLocalModForUpdate(mod: ModEntryLocal): boolean {
        const serverMod = mod.serverCounterpart
        if (!serverMod) return false
        return semver_gt(serverMod.version, mod.version)
    }

    static async appendToUpdateModsToQueue(): Promise<boolean> {
        await ModDB.loadAllMods()
        await LocalMods.initAll()

        const mods: ModEntryLocal[] = LocalMods.getAll().filter(mod => mod.hasUpdate && !mod.isGit)
        const serverMods = mods.map(mod => mod.serverCounterpart!)
        InstallQueue.add(...serverMods)
        InstallQueue.add(...(await this.findDepsDatabase(serverMods, ModDB.modRecord)))
        for (const mod of serverMods) mod.installStatus = 'update'

        return mods.length > 0
    }

    static async checkAllLocalModsForUpdate() {
        await this.appendToUpdateModsToQueue()
        ModInstallDialogs.showAutoUpdateDialog()
    }
}
