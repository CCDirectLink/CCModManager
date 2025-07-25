import { ModInstaller } from './mod-installer'
import { ModDB } from './moddb'
import { ModEntry, ModImageConfig as ModIconConfig, NPDatabase } from './types'
import type { IncomingMessage } from 'http'

const fs: typeof import('fs') = window.require?.('fs')
const http: typeof import('http') = window.require?.('http')
const https: typeof import('https') = window.require?.('https')

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

function getTag(head: IncomingMessage): string {
    switch (typeof head.headers.etag) {
        case 'string':
            return head.headers.etag
        case 'object':
            return head.headers.etag[0]
        default:
            return ''
    }
}

async function getETag(url: string): Promise<string> {
    const uri = new URL(url)
    const lib = uri.protocol === 'https:' ? https : http
    const get = lib?.get
    if (!get) return 'nointernet'

    const head: IncomingMessage | undefined = await new Promise(resolve =>
        get(url, { method: 'HEAD' })
            .on('response', resp => resolve(resp))
            .on('error', _ => resolve(undefined))
    )
    if (!head) return 'nointernet'
    if (head.statusCode == 404) throw new Error(`url not found 404: ${url}`)
    if (head.statusCode == 400) throw new Error(`url invalid request 400: ${url}`)
    if (head.statusCode == 301) throw new Error(`url invalid request 301: ${url}`)
    return getTag(head)
}

export class FileCache {
    private static cacheDir: string

    private static inCache: Set<string>
    private static cache: Record<string, any> = {}

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

        this.inCache = new Set()
        if (!fs) return

        await fs.promises.mkdir(`${this.cacheDir}`, { recursive: true })
        for await (const path of getFilesRecursive(this.cacheDir))
            this.inCache.add(path.substring('./assets/mod-data/CCModManager/cache/'.length))
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
        const urlPath = `icons/${mod.id}.png`
        const path = `${mod.database}/${urlPath}`
        const ccPath: string = `${this.cacheDir.substring('./assets/'.length)}/${path}`
        if (this.inCache.has(path)) return ccPath

        const url = `${ModDB.databases[mod.database].url}/${urlPath}`
        const data = new Uint8Array(await (await fetch(url)).arrayBuffer())
        await fs.promises.writeFile(`${this.cacheDir}/${path}`, data)
        this.inCache.add(path)
        return ccPath
    }

    private static async downloadAndWriteDatabase(path: string, url: string, eTag: string) {
        const data: NPDatabase = (this.cache[path] = await (await fetch(url)).json())
        data.eTag = eTag
        fs.promises.writeFile(`${this.cacheDir}/${path}`, JSON.stringify(data))
        this.inCache.add(path)
        return data
    }

    static async checkDatabaseUrl(url: string): Promise<boolean> {
        url = `${url}/npDatabase.min.json`
        try {
            await getETag(url)
            return true
        } catch {
            return false
        }
    }

    static async getDatabase(name: string, create: (database: NPDatabase) => void): Promise<void> {
        const path = `${name}/db.json`
        const url = `${ModDB.databases[name].url}/npDatabase.min.json`

        const cachedPromise = this.getCachedFile<NPDatabase>(path, true)
        let eTag!: string
        const eTagPromise = getETag(url).then(async newEtag => {
            eTag = newEtag
            const cached = await cachedPromise
            if (eTag != 'nointernet' && cached && cached.eTag != eTag) {
                const data = await this.downloadAndWriteDatabase(path, url, eTag)
                create(data)
            }
        })

        const cached = await cachedPromise
        if (cached) return create(cached)

        await eTagPromise
        if (!eTag) throw new Error('eTag unset somehow')
        if (eTag == 'nointernet') return
        const data = await this.downloadAndWriteDatabase(path, url, eTag)
        create(data)
    }

    private static async getCachedFile<T>(path: string, toJSON: boolean = false): Promise<T | undefined> {
        if (!this.inCache.has(path)) return
        const cached = this.cache[path]
        if (cached) return cached
        this.inCache.add(path)
        let data = await fs.promises.readFile(`${this.cacheDir}/${path}`, 'utf8')
        if (toJSON) data = JSON.parse(data.toString())
        this.cache[path] = data
        return data as T
    }

    static async deleteOnDiskCache() {
        await ModInstaller.removeDirRecursive(this.cacheDir)
        await fs.promises.mkdir(this.cacheDir, { recursive: true })
    }
}
