import { ModInstaller } from './mod-installer'
import { ModDB } from './moddb'
import { ModEntry, ModImageConfig as ModIconConfig, NPDatabase } from './types'

const fs: typeof import('fs') = window.require?.('fs')

async function* getFilesRecursive(dir: string): AsyncIterable<string> {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
    for (const dirent of dirents) {
        const res = `${dir}/${dirent.name}`
        if (dirent.isDirectory()) {
            yield* getFilesRecursive(res)
        } else {
            yield res
        }
    }
}

async function getETag(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            method: 'HEAD',
            mode: 'cors',
            cache: 'no-store',
        })

        if (!response.ok) {
            if (response.status === 404) throw new Error(`url not found 404: ${url}`)
            if (response.status === 400) throw new Error(`url invalid request 400: ${url}`)
            if (response.status === 301) throw new Error(`url invalid request 301: ${url}`)
            throw new Error(`HTTP error: ${response.status}`)
        }

        /* old versions of nwjs dont report etag??
         * so just pick a random one to re-fetch each time */
        const etag = response.headers.get('etag') || `${Math.random()}`
        return etag
    } catch (err) {
        return 'nointernet'
    }
}

export class FileCache {
    private static cacheDir: string

    private static existsOnDisk: Set<string>
    private static readingPromises: Record<string, Promise<any>>

    static getDefaultModIconConfig() {
        return {
            path: 'media/gui/menu.png',
            offsetX: 536,
            offsetY: 160,
            sizeX: 24,
            sizeY: 24,
        }
    }

    static async init() {
        this.cacheDir = './assets/mod-data/CCModManager/cache'

        this.existsOnDisk = new Set()
        this.readingPromises = {}
        if (!fs) return

        await fs.promises.mkdir(`${this.cacheDir}`, { recursive: true })
        for await (const path of getFilesRecursive(this.cacheDir)) {
            this.existsOnDisk.add(path)
        }
    }

    static prepareDatabase(name: string) {
        fs?.promises.mkdir(`${this.cacheDir}/${name}/icons`, { recursive: true })
    }

    static async getIconConfig(mod: ModEntry): Promise<ModIconConfig> {
        if (mod.isLocal) return mod.iconConfig
        if (mod.hasIcon)
            return {
                path: await this.getIcon(mod),
                offsetX: 0,
                offsetY: 0,
                sizeX: 24,
                sizeY: 24,
            }
        return this.getDefaultModIconConfig()
    }

    private static async saveFile(path: string, data: unknown) {
        await fs.promises.writeFile(path, data)
        this.existsOnDisk.add(path)
    }

    private static async fetchAndWriteIcon(url: string, ccPath: string) {
        let data: Uint8Array | undefined
        try {
            const resp = await fetch(url, { cache: 'no-store' })
            const buffer = await resp.arrayBuffer()
            data = new Uint8Array(buffer)
        } catch (e) {
            console.warn(`ccmodmanager: failed to fetch icon: ${url}`, e)
        }
        if (data) {
            try {
                await this.saveFile(ccPath, data)
            } catch (e) {
                console.warn(`ccmodmanager: failed to save mod icon: ${ccPath}`, e)
            }
        }
    }

    private static async getIcon(mod: ModEntry): Promise<string> {
        const urlPathSuffix = `icons/${mod.id}.png`
        const url = `${ModDB.databases[mod.database].url}/${urlPathSuffix}`
        const ccPath: string = `${this.cacheDir}/${mod.database}/${urlPathSuffix}`
        const imgPath = ccPath.substring('./assets/'.length)

        if (!this.existsOnDisk.has(ccPath)) {
            await (this.readingPromises[ccPath] ??= this.fetchAndWriteIcon(url, ccPath))
            delete this.readingPromises[ccPath]
        }
        return imgPath
    }

    static async checkDatabaseUrl(url: string): Promise<boolean> {
        url = `${url}/npDatabase.min.json`
        try {
            /* an error will be thrown if the url is invalid */
            new URL(url)

            return (await getETag(url)) != 'nointernet'
        } catch {
            return false
        }
    }

    private static isJsonDatabase(json: unknown): json is NPDatabase {
        if (!json || typeof json !== 'object' || Array.isArray(json)) return false
        for (const v of Object.values(json)) {
            if (typeof v != 'object') continue
            if (!('installation' in v) || !('metadataCCMod' in v)) return false
        }
        return true
    }

    private static async readDatabaseFromDisk(ccPath: string): Promise<NPDatabase | undefined> {
        try {
            const str = await fs.promises.readFile(ccPath, 'utf8')
            const json = JSON.parse(str)
            if (!this.isJsonDatabase(json)) throw new Error('json is not a valid database')

            return json
        } catch (e) {
            console.error(`ccmodmanager: failed to read database: ${ccPath}`, e)
            return
        }
    }

    private static async fetchDatabase(
        name: string,
        url: string,
        ccPath: string,
        etag: string
    ): Promise<NPDatabase | undefined> {
        let data: any
        try {
            const resp = await fetch(url, { cache: 'no-store' })
            data = await resp.json()
        } catch (e) {
            console.error(`ccmodmanager: failed to fetch database: ${name}`, e)
            return
        }

        if (!this.isJsonDatabase(data)) {
            console.error(`ccmodmanager: failed to fetch database: ${name}, json is not a valid database`)
            return
        }
        data.eTag = etag

        try {
            const str = JSON.stringify(data)
            await this.saveFile(ccPath, str)
        } catch (e) {
            console.warn(`ccmodmanager: failed to save database: ${name}`, e)
        }

        return data
    }

    static async getDatabase(name: string): Promise<NPDatabase | undefined> {
        const url = `${ModDB.databases[name].url}/npDatabase.min.json`
        const ccPath = `${this.cacheDir}/${name}/db.json`

        const etag = await getETag(url)

        if (this.existsOnDisk.has(ccPath)) {
            const database: NPDatabase | undefined = await (this.readingPromises[ccPath] ??=
                this.readDatabaseFromDisk(ccPath))
            delete this.readingPromises[ccPath]

            if (!database) {
                this.existsOnDisk.delete(ccPath)
            } else {
                if (etag == 'nointernet' || etag == database.eTag) return database
            }
        }

        const database = await (this.readingPromises[ccPath] ??= this.fetchDatabase(name, url, ccPath, etag))
        delete this.readingPromises[ccPath]
        return database
    }

    static async deleteOnDiskCache() {
        await ModInstaller.removeDirRecursive(this.cacheDir)
        await fs.promises.mkdir(this.cacheDir, { recursive: true })
    }
}
