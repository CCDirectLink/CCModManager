import { ModEntry, ModEntryLocal, ModEntryServer, NPDatabase } from './types'
import { FileCache } from './cache'
import { Opts } from './options'
import { semver } from './library-providers'

export class ModDB {
    private static databasesLoaded: boolean = false

    static databases: Record<string, ModDB>

    static modRecord: Record<string, ModEntryServer[]>

    private static testingOptInModIds: Set<string>

    static addDatabase(db: ModDB) {
        this.databases[db.name] = db
    }

    static loadDatabases(force: boolean = false) {
        if (!force && this.databasesLoaded) return
        this.databasesLoaded = true
        this.databases = {}
        const urls = Opts.repositories
        for (const url of urls) {
            ModDB.addDatabase(new ModDB(url))
        }

        ModDB.testingOptInModIds = new Set(Opts.testingOptInMods)
    }

    static repoURLToFileName(url: string): string {
        url = this.minifyRepoURL(url)
        url.replace(/\//g, '_')
        return url
    }

    static minifyRepoURL(url: string): string {
        if (url.startsWith('https://raw.githubusercontent.com/')) {
            url = `@${url.substring('https://raw.githubusercontent.com/'.length)}`
        }
        return url
    }

    static expandRepoURL(url: string): string {
        if (url.startsWith('@')) {
            url = `https://raw.githubusercontent.com/${url.substring(1)}`
        }
        return url
    }

    static saveDatabases() {
        Opts.repositories = Object.values(this.databases).map(db => this.minifyRepoURL(db.url))
    }

    static async loadAllMods(callback: () => void = () => {}, prefferCache: boolean = false): Promise<void> {
        if (prefferCache && this.modRecord) {
            callback()
            return
        }
        this.modRecord = {}
        const promises: Promise<void>[] = []
        for (const dbName in ModDB.databases) {
            const db = ModDB.databases[dbName]
            if (db.active) {
                this.modRecord[dbName] = []
                promises.push(
                    new Promise(resolve => {
                        db.getMods(mods => {
                            ModDB.modRecord[dbName] = mods
                            callback()
                            resolve()
                        })
                    })
                )
            }
        }
        await Promise.all(promises)
    }

    static getHighestVersionMod<T extends ModEntry>(mods: T[]): T {
        return mods.reduce((highestVerMod, currMod) =>
            semver.gt(currMod.version, highestVerMod.version) ? currMod : highestVerMod
        )
    }

    static async getLocalModOrigins(id: string): Promise<ModEntryServer[]> {
        const matches: ModEntryServer[] = []
        for (const dbName in this.databases) {
            const moddb = this.databases[dbName]
            let modRecord = moddb.modRecord
            if (!modRecord) {
                await moddb.getMods(() => {})
                modRecord = moddb.modRecord
            }
            if (!modRecord) throw new Error('wat?')

            const dbMod = modRecord[id]
            if (dbMod) matches.push(dbMod)
        }
        return matches
    }

    static async resolveLocalModOrigin(mod: ModEntryLocal) {
        const serverMods = await this.getLocalModOrigins(mod.id)
        if (serverMods.length == 0) return
        let highestVerMod: ModEntryServer = serverMods[0]
        for (const serverMod of serverMods) {
            serverMod.localCounterpart = mod
            if (!this.isDatabaseTesting(serverMod.database)) {
                if (semver.gt(highestVerMod.version, serverMod.version)) {
                    highestVerMod = serverMod
                }
            }
        }
        mod.serverCounterpart = highestVerMod
        mod.database = highestVerMod.database
        mod.isLegacy = highestVerMod.isLegacy
    }

    static isModTestingOptIn(modId: string): boolean {
        return this.testingOptInModIds.has(modId)
    }

    static setModTestingOptInStatus(modId: string, status: boolean) {
        if (status) {
            this.testingOptInModIds.add(modId)
        } else {
            this.testingOptInModIds.delete(modId)
        }
        Opts.testingOptInMods = [...this.testingOptInModIds]
    }

    private static isDatabaseTesting(databaseName: string): boolean {
        return databaseName.includes('testing')
    }

    // private static isModTesting(mod: ModEntryServer) {
    //     return this.isDatabaseTesting(this.databases[mod.database])
    // }

    static removeModDuplicatesAndResolveTesting(
        modsRecord: Record<string, ModEntryServer[]>
    ): Record<string, ModEntryServer> {
        const uniqueMods: Record<string /*modid */, ModEntryServer> = {}

        const testingDbs: string[] = []
        const nonTestingDbs: string[] = []

        for (const dbName in modsRecord) {
            ;(this.isDatabaseTesting(dbName) ? testingDbs : nonTestingDbs).push(dbName)
        }

        for (const dbName of nonTestingDbs) {
            const mods = modsRecord[dbName]
            for (const mod of mods) {
                const prevMod = uniqueMods[mod.id]
                if (prevMod) {
                    uniqueMods[mod.id] = ModDB.getHighestVersionMod([prevMod, mod])
                } else {
                    uniqueMods[mod.id] = mod
                }
            }
        }

        /* resolve testing */
        const allNonTestingMods = nonTestingDbs
            .map(dbName => modsRecord[dbName])
            /* flatMap */
            .reduce((acc, v) => acc.concat(v), [])

        for (const testingDbName of testingDbs) {
            for (const testingMod of modsRecord[testingDbName]) {
                // prettier-ignore
                const matchingNonTestingMods = allNonTestingMods.filter(
                    nonTestingMod =>
                        nonTestingMod.id == testingMod.id
                        && semver.gt(testingMod.version, nonTestingMod.version)
                )

                for (const matchingMod of matchingNonTestingMods) {
                    matchingMod.testingVersion = testingMod
                    matchingMod.lastUpdateTimestamp = testingMod.lastUpdateTimestamp
                    matchingMod.stars = testingMod.stars
                }
            }
        }

        return uniqueMods
    }

    name: string
    database!: NPDatabase
    modRecord!: Record<string, ModEntryServer>

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
            const ccmod = data.metadataCCMod!
            const authors = ccmod.authors
            this.modRecord[name] = {
                database: databaseName,
                isLocal: false,
                id: name,
                name: ig.LangLabel.getText(ccmod.title),
                description: ig.LangLabel.getText(ccmod.description),
                version: ccmod.version,
                isLegacy: false,
                hasIcon: ccmod.icons ? !!ccmod.icons['24'] : false,
                stars: data.stars,
                dependencies: ccmod.dependencies || {},
                installation: data.installation,
                lastUpdateTimestamp: data.lastUpdateTimestamp,
                authors: authors ? (typeof authors === 'string' ? [authors] : authors) : ['unknown'],
                tags: ccmod.tags ?? [],
                repositoryUrl: ccmod.repository,
                releasePages: data.releasePages,
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
}
