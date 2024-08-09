import { LocalMods } from './local-mods'
import { ModDB } from './moddb'
import { ModEntry, ModEntryBaseBase, ModEntryLocal, ModEntryLocalVirtual, ModEntryServer } from './types'
import { ModInstallDialogs } from './gui/install-dialogs'

const fs: typeof import('fs') = (0, eval)("require('fs')")
const path: typeof import('path') = (0, eval)("require('path')")
const crypto: typeof import('crypto') = (0, eval)('require("crypto")')

import { loadAsync } from 'jszip'
import semver_satisfies from 'semver/functions/satisfies'
import semver_gt from 'semver/functions/gt'

// @ts-expect-error
import rimraf from 'rimraf'
import { Opts } from './options'

export class InstallQueue {
    private static queue: ModEntryServer[] = []

    static changeUpdate() {
        modmanager.gui.menu &&
            sc.Model.notifyObserver(modmanager.gui.menu, modmanager.gui.MENU_MESSAGES.SELECTED_ENTRIES_CHANGED)
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
        return [...this.queue].map(mod => {
            if (mod.testingVersion && ModDB.isModTestingOptIn(mod.id)) {
                if (mod.installStatus) mod.testingVersion.installStatus = mod.installStatus
                mod = mod.testingVersion
            }
            return mod
        })
    }
}

type DepEntry = { mod: ModEntryServer; versionReqRanges: string[] }

export type ModInstallerDownloadingProgress = { length: number; received: number }
export type ModInstallerEventListener = {
    preparing(mod: ModEntryServer): void
    downloading(mod: ModEntryServer, progressFunc: () => ModInstallerDownloadingProgress): void
    installing(mod: ModEntryServer): void
    done(mod: ModEntryServer): void
}

export class ModInstaller {
    static eventListeners: ModInstallerEventListener[] = []

    static record: Record<string, ModEntryServer>
    static byNameRecord: Record<string, ModEntryServer>
    static virtualMods: Record<string, ModEntryLocalVirtual>

    static init() {
        this.virtualMods = {
            crosscode: {
                id: 'crosscode',
                name: 'CrossCode',
                description: 'The base game.',
                version: LocalMods.getCCVersion(),
            },
            'post-game': {
                id: 'post-game',
                name: 'Post Game DLC',
                description: 'The postgame DLC.',
                version: LocalMods.getCCVersion(),
                isExtension: true,
            },
            manlea: {
                id: 'manlea',
                name: 'Manlea',
                description: 'The Manlea skin DLC.',
                version: LocalMods.getCCVersion(),
                isExtension: true,
            },
            'ninja-skin': {
                id: 'ninja-skin',
                name: 'Ninja Skin',
                description: 'The ninja skin DLC.',
                version: LocalMods.getCCVersion(),
                isExtension: true,
            },
            'scorpion-robo': {
                id: 'scorpion-robo',
                name: 'PC Exclusive Extension',
                description: 'The formerly exclusive PC content.',
                version: LocalMods.getCCVersion(),
                isExtension: true,
            },
            'snowman-tank': {
                id: 'snowman-tank',
                name: 'Xbox Exclusive Extension',
                description: 'The formerly exclusive Xbox One content.',
                version: LocalMods.getCCVersion(),
                isExtension: true,
            },
            'fish-gear': {
                id: 'fish-gear',
                name: 'PS4 Exclusive Extension',
                description: 'The formerly exclusive PS4 content.',
                version: LocalMods.getCCVersion(),
                isExtension: true,
            },
            'flying-hedgehag': {
                id: 'flying-hedgehag',
                name: 'Switch Exclusive Extension',
                description: 'The formerly exclusive Nintendo Switch content.',
                version: LocalMods.getCCVersion(),
                isExtension: true,
            },
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
                if (this.virtualMods[depName].isExtension && !ig.extensions.hasExtension(depName)) {
                    throw new Error(`Mod: ${mod.id} "${mod.name}" has a dependant extension missing: ${depName}`)
                }
                this.setOrAddNewer(deps, { id: depName } as any, reqVersionRange)
                continue
            }
            const dep = this.getModByDepName(depName)

            if (!dep) throw new Error(`Mod: ${mod.id} "${mod.name}" has a dependency missing: ${depName}`)

            this.setOrAddNewer(deps, dep, reqVersionRange)

            const depDeps = this.getModDependencies(dep)
            for (const depDepName in depDeps) {
                const depDep = depDeps[depDepName]
                this.setOrAddNewer(deps, depDep.mod, ...depDep.versionReqRanges)
            }
        }
        return deps
    }

    private static matchesVersionReqRanges(mod: ModEntryBaseBase, versionReqRanges: string[]) {
        for (const range of versionReqRanges) {
            if (!semver_satisfies(mod.version, range)) return false
        }
        return true
    }

    static async findDepsDatabase(
        mods: ModEntryServer[],
        modRecords: Record<string, ModEntryServer[]>,
        includeInstalled: boolean = false
    ): Promise<ModEntryServer[]> {
        /* resolve local mod origin */
        LocalMods.initAll()

        this.record = ModDB.removeModDuplicatesAndResolveTesting(modRecords)
        this.byNameRecord = {}
        for (const modId in this.record) {
            const mod = this.record[modId]
            this.byNameRecord[mod.name] = mod
        }

        const deps: Record<string, DepEntry> = {}
        for (const mod of mods) {
            mod.installStatus = 'new' /* set default */
            const modDeps = this.getModDependencies(mod)
            for (const modId in modDeps) {
                const entry = modDeps[modId]
                this.setOrAddNewer(deps, entry.mod, ...entry.versionReqRanges)
                entry.mod.installStatus = 'dependency'
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
                throw new Error(
                    `${virtualMod.name} version does not meat the requirement: ${dep.versionReqRanges.join(', ')}`
                )
            }
            delete deps[virtualModId]
        }
        if (!includeInstalled) {
            /* check if dependency versions are in the database */
            for (const modId in deps) {
                const { mod: serverMod, versionReqRanges } = deps[modId]
                if (!this.matchesVersionReqRanges(serverMod, versionReqRanges))
                    throw new Error(
                        `Dependency: ${serverMod.id} "${serverMod.name}" that cannot be resolved: version range: ${versionReqRanges.join(', ')} was not met. Database has only: ${serverMod.version}`
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

        const modsToInstall: ModEntryServer[] = mods.filter(
            mod => mod.installStatus == 'new' || mod.installStatus == 'dependency'
        )
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
            return this.installCCLoader(mod)
        }
        await this.uninstallMod(local)
        await this.downloadAndInstallMod(mod)
    }

    private static downloadWithProgress(resp: Response): {
        arrayBuffer: Promise<ArrayBuffer>
        progressFunc: () => ModInstallerDownloadingProgress
    } {
        const reader = resp.body!.getReader()
        const length = +resp.headers.get('content-length')!
        let received = 0

        return {
            arrayBuffer: new Promise(async resolve => {
                const chunks: Uint8Array[] = []

                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break

                    chunks.push(value)
                    received += value.length
                }

                const body = new Uint8Array(received)
                let position = 0
                for (const chunk of chunks) {
                    body.set(chunk, position)
                    position += chunk.length
                }
                resolve(body.buffer)
            }),
            progressFunc: () => ({ length, received }),
        }
    }

    private static async downloadAndInstallMod(mod: ModEntryServer) {
        console.log('installing mod:', mod.id)

        for (const { preparing: func } of this.eventListeners) func && func(mod)

        const installation = mod.installation.find(i => i.type === 'zip')
        if (!installation) throw new Error(`Mod: ${mod.id} "${mod.name}" has no known installation methods.`)

        const modId = mod.id.replace(/ /g, '_')
        if (installation.type == 'zip') {
            console.log(`downloading ${installation.url}`)

            const resp = await fetch(installation.url)

            const { arrayBuffer, progressFunc } = this.downloadWithProgress(resp)

            for (const { downloading: func } of this.eventListeners) func && func(mod, progressFunc)

            const data = await arrayBuffer

            if (!this.checkSHA256(data, installation.hash.sha256))
                throw new Error(`Mod: ${mod.id} "${mod.name}" sha256 digest mismatch. Contact mod developers in the modding discord.`)

            for (const { installing: func } of this.eventListeners) func && func(mod)

            if (installation.url.endsWith('.ccmod') && !Opts.unpackCCMods) {
                await this.installCCMod(data, modId)
            } else {
                const installationSource: string | undefined =
                    installation.url.endsWith('.ccmod') && Opts.unpackCCMods ? '' : installation.source

                if (installationSource === undefined)
                    throw new Error(`Mod: ${mod.id} "${mod.name}" is a .zip and has no source field. This is a database error.`)

                await this.installModZip(data, modId, installationSource)
            }
        }
        for (const { done: func } of this.eventListeners) func && func(mod)
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

    private static async installModZip(
        data: ArrayBuffer,
        id: string,
        source: string,
        prefixPath: string = 'assets/mods'
    ) {
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

        if (installation.source === undefined) throw new Error(`I mean come on ccloader has to have a source field`)

        const packageJsonPath: string = 'package.json'
        async function readPackageJson(): Promise<{ 'chromium-args': string }> {
            return JSON.parse(await fs.promises.readFile(packageJsonPath, 'utf8'))
        }

        let chromiumFlags: string | undefined
        if (Opts.keepChromiumFlags) {
            chromiumFlags = (await readPackageJson())['chromium-args']
        }

        await this.installModZip(data, '', installation.source, '')

        if (chromiumFlags) {
            const packageJson = await readPackageJson()
            packageJson['chromium-args'] = chromiumFlags
            await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 4))
        }
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
        return ModInstaller.removeDirRecursive(mod.path)
    }

    static async removeDirRecursive(path: string) {
        return new Promise<void>(resolve => rimraf(path, fs, () => resolve()))
    }

    static restartGame() {
        if ('chrome' in window) {
            ;(window.chrome as any).runtime.reload()
        } else {
            window.location.reload()
        }
    }

    static checkLocalModForUpdate(mod: ModEntryLocal): boolean {
        const serverMod = mod.serverCounterpart
        if (!serverMod) return false
        const testingMod = serverMod.testingVersion
        if (testingMod && ModDB.isModTestingOptIn(serverMod.id)) {
            return semver_gt(testingMod.version, mod.version)
        }
        return semver_gt(serverMod.version, mod.version)
    }

    static async appendToUpdateModsToQueue(): Promise<boolean> {
        await ModDB.loadAllMods()
        ModDB.removeModDuplicatesAndResolveTesting(ModDB.modRecord)
        await LocalMods.initAll()
        await LocalMods.refreshOrigin()

        const mods: ModEntryLocal[] = LocalMods.getAll().filter(mod => mod.hasUpdate && !mod.isGit)
        // prettier-ignore
        const serverMods = mods
            .map(mod => mod.serverCounterpart!)
            .map(mod => (mod.testingVersion && ModDB.isModTestingOptIn(mod.id) ? mod.testingVersion : mod))
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
