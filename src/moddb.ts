// const fs: typeof import('fs') = (0, eval)("require('fs')")
// const path: typeof import('path') = (0, eval)("require('path')")

// import jszip from 'jszip'
import semver from 'semver'
import { ModEntryLocal, ModEntryServer, ModID, NPDatabase } from './types'
import { FileCache } from './cache'

export class ModDB {
    static databases: Record<string, ModDB> = {
        krypek: new ModDB('krypek', 'https://raw.githubusercontent.com/krypciak/CCModDB/ccmodjson'),
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
        if (matches.length > 1) {
            // TODO match acual mod version not the highest
            matches[0] = matches.reduce((highestVerMod, currMod) => (semver.gt(currMod.version, highestVerMod.version) ? currMod : highestVerMod))
        }
        mod.database = matches[0].database
    }

    database!: NPDatabase
    modRecord!: Record<ModID, ModEntryServer>

    constructor(
        public name: string,
        public url: string,
        public active: boolean = true
    ) {
        FileCache.addDatabase(name, url)
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
