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

    private static async getIcon(mod: ModEntry): Promise<string> {
        const urlPathSuffix = `icons/${mod.id}.png`
        const url = `${ModDB.databases[mod.database].url}/${urlPathSuffix}`
        const ccPath: string = `${this.cacheDir}/${mod.database}/${urlPathSuffix}`
        const imgPath = ccPath.substring('./assets/'.length)

        if (!this.existsOnDisk.has(ccPath)) {
            const fetchAndWrite = async () => {
                const data = new Uint8Array(await (await fetch(url, { cache: 'no-store' })).arrayBuffer())

                await fs.promises.writeFile(ccPath, data)
                this.existsOnDisk.add(ccPath)
                delete this.readingPromises[ccPath]
            }
            await (this.readingPromises[ccPath] ??= fetchAndWrite())
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

    static async getDatabase(name: string): Promise<NPDatabase> {
        const url = `${ModDB.databases[name].url}/npDatabase.min.json`
        const ccPath = `${this.cacheDir}/${name}/db.json`

        const etag = await getETag(url)

        if (this.existsOnDisk.has(ccPath)) {
            const readFile = async () => {
                const json = JSON.parse(await fs.promises.readFile(ccPath, 'utf8'))
                delete this.readingPromises[ccPath]
                return json
            }
            const data: NPDatabase = await (this.readingPromises[ccPath] ??= readFile())

            if (etag == 'nointernet' || etag == data.eTag) return data
        }

        return (this.readingPromises[ccPath] ??= (async () => {
            const data: NPDatabase = await (await fetch(url, { cache: 'no-store' })).json()
            data.eTag = etag

            await fs.promises.writeFile(ccPath, JSON.stringify(data))
            this.existsOnDisk.add(ccPath)
            delete this.readingPromises[ccPath]

            return data
        })())
    }

    static async deleteOnDiskCache() {
        await ModInstaller.removeDirRecursive(this.cacheDir)
        await fs.promises.mkdir(this.cacheDir, { recursive: true })
    }
}
