// const fs: typeof import('fs') = (0, eval)("require('fs')")
// const path: typeof import('path') = (0, eval)("require('path')")

// import jszip from 'jszip'
import semver from 'semver'
import { ModEntry, ModEntryLocal, ModEntryServer, ModID, NPDatabase } from './types'
import { FileCache } from './cache'

export class ModDB {
    private static localStorageKey = 'CCModManager-databases'
    private static databasesLoaded: boolean = false

    static databases: Record<string, ModDB>

    static addDatabase(db: ModDB) {
        this.databases[db.name] = db
    }

    static loadDatabases(force: boolean = false) {
        if (!force && this.databasesLoaded) return
        this.databasesLoaded = true
        this.databases = {}
        const urls: string[] = JSON.parse(localStorage.getItem(this.localStorageKey) || JSON.stringify(['@krypciak']))
        for (const url of urls) {
            ModDB.addDatabase(new ModDB(url))
        }
        this.saveDatabases()
    }

    static repoURLToFileName(url: string): string {
        url = this.minifyRepoURL(url)
        url.replace(/\//g, '_')
        return url
    }

    static minifyRepoURL(url: string): string {
        if (url.startsWith('https://raw.githubusercontent.com/')) {
            url = `@${url.substring('https://raw.githubusercontent.com/'.length)}`
            if (url.endsWith('/master')) url = url.substring(0, url.length - '/master'.length)
            if (url.endsWith('/CCModDB')) url = url.substring(0, url.length - '/CCModDB'.length)
        }
        return url
    }

    static expandRepoURL(url: string): string {
        if (url.startsWith('@')) {
            if (!url.endsWith('/CCModDB') && !url.match(/\//g)) url = `${url}/CCModDB`
            if (!url.endsWith('/master') && url.match(/\//g)!.length == 1) url = `${url}/master`
            url = `https://raw.githubusercontent.com/${url.substring(1)}`
        }
        return url
    }

    static saveDatabases() {
        const urls: string[] = Object.values(this.databases).map(db => this.minifyRepoURL(db.url))
        localStorage.setItem(this.localStorageKey, JSON.stringify(urls))
    }

    static getHighestVersionMod(mods: ModEntry[]): ModEntry {
        return mods.reduce((highestVerMod, currMod) => (semver.gt(currMod.version, highestVerMod.version) ? currMod : highestVerMod))
    }

    static async resolveLocalModOrigin(mod: ModEntryLocal) {
        const matches: ModEntryServer[] = []
        for (const dbName in this.databases) {
            const moddb = this.databases[dbName]
            let modRecord = moddb.modRecord
            if (!modRecord) {
                await moddb.getMods(() => {})
                modRecord = moddb.modRecord
            }
            if (!modRecord) throw new Error('wat?')

            const dbMod = modRecord[mod.id]
            if (dbMod) matches.push(dbMod)
        }
        if (matches.length == 0) return
        if (matches.length == 1) {
            mod.database = matches[0].database
        } else {
            mod.database = this.getHighestVersionMod(matches).database
        }
    }

    name: string
    database!: NPDatabase
    modRecord!: Record<ModID, ModEntryServer>

    constructor(
        public url: string,
        public active: boolean = true,
        prepare: boolean = true
    ) {
        this.name = ModDB.repoURLToFileName(url)
        this.url = ModDB.expandRepoURL(this.name)
        prepare && FileCache.prepareDatabase(this.name)
    }

    async isUrlValid(): Promise<boolean> {
        if (this.name.startsWith('http')) return false
        return FileCache.checkDatabaseUrl(this.url)
    }

    private createModEntriesFromDatabase(databaseName: string) {
        this.modRecord = {}
        for (const [name, data] of Object.entries(this.database)) {
            if (typeof data === 'string') continue
            const meta = data.metadata
            const ccmod = data.metadataCCMod
            this.modRecord[name] = {
                database: databaseName,
                isLocal: false,
                id: name,
                name: ccmod?.title ? ig.LangLabel.getText(ccmod.title) : meta!.ccmodHumanName || name,
                description: ccmod?.description ? ig.LangLabel.getText(ccmod.description) : meta!.description,
                version: ccmod?.version || meta!.version,
                isLegacy: !ccmod,
                hasIcon: ccmod?.icons ? !!ccmod.icons['24'] : false,
                stars: data.stars,
            }
        }
    }

    async getMods(callback: (mods: ModEntryServer[]) => void): Promise<void> {
        const create = (database: NPDatabase) => {
            this.database = database
            this.createModEntriesFromDatabase(this.name)
            callback(Object.values(this.modRecord))
        }
        await FileCache.getDatabase(this.name, create)
    }

    /*
    async downloadMod(id: ModID) {
        const pkg = await this.getMod(id)

        const installation = pkg.installation.find(i => i.type === 'ccmod') || pkg.installation.find(i => i.type === 'modZip')
        if (!installation) throw new Error(`I don' know how to download this mod`)

        const resp = await fetch(installation.url)
        const data = await resp.arrayBuffer()

        switch (installation.type) {
            case 'ccmod':
                return await this.installCCMod(data, id)
            case 'modZip':
                return await this.installModZip(data, id, installation.source)
        }
    }

    private async installCCMod(data: ArrayBuffer, id: ModID) {
        await fs.promises.writeFile(`assets/mods/${id}.ccmod`, new Uint8Array(data))
    }

    private async installModZip(data: ArrayBuffer, id: ModID, source: string) {
        const zip = await jszip.loadAsync(data)

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
                    } catch {
                    }
                    await fs.promises.writeFile(filepath, data)
                })
        )
    }

    private async getMod(id: ModID) {
        const data = this.database[id]
        if (data) return data

        const newData = this.database[id]
        if (!newData) throw new Error('Could not find name')
        return newData
    }
    */
}
