import { ModEntry, ModImageConfig as ModIconConfig, NPDatabase } from './types'

const fs: typeof import('fs') = (0, eval)("require('fs')")
import type { IncomingMessage } from 'http'
const http: typeof import('http') = (0, eval)("require('http')")
const https: typeof import('https') = (0, eval)("require('https')")

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
    const { get } = uri.protocol === 'https:' ? https : http

    const head: IncomingMessage = await new Promise((resolve, reject) =>
        get(url, { method: 'HEAD' })
            .on('response', resp => resolve(resp))
            .on('error', err => reject(err))
    )
    return getTag(head)
}

export class FileCache {
    private static cacheDir: string

    private static inCache: Set<string>
    private static cache: Record<string, any> = {}
    private static databases: Record<string /* name */, string /* url */> = {}

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
        await fs.promises.mkdir(`${this.cacheDir}`, { recursive: true })

        this.inCache = new Set()
        for await (const path of getFilesRecursive(this.cacheDir)) this.inCache.add(path.substring('./assets/mod-data/CCModManager/cache/'.length))
    }

    static addDatabase(name: string, url: string) {
        FileCache.databases[name] = url
        fs.mkdir(`${this.cacheDir}/${name}/icons`, { recursive: true }, () => {})
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

        const url = `${this.databases[mod.database]}/${urlPath}`
        const data = Buffer.from(await (await fetch(url)).arrayBuffer())
        await fs.promises.writeFile(`${this.cacheDir}/${path}`, data)
        this.inCache.add(path)
        return ccPath
    }

    private static async downloadAndWriteDatabase(path: string, url: string, eTag: string) {
        const data: NPDatabase = (this.cache[path] = await (await fetch(url)).json())
        data.eTag = eTag
        fs.writeFile(`${this.cacheDir}/${path}`, JSON.stringify(data), () => {})
        this.inCache.add(path)
        return data
    }

    static async getDatabase(name: string, create: (database: NPDatabase) => void): Promise<void> {
        const path = `${name}.json`
        const url = `${this.databases[name]}/npDatabase.json`

        const cachedPromise = this.getCachedFile<NPDatabase>(path, true)
        let eTag!: string
        const eTagPromise = getETag(url).then(async newEtag => {
            eTag = newEtag
            const cached = await cachedPromise
            if (cached && cached.eTag != eTag) {
                const data = await this.downloadAndWriteDatabase(path, url, eTag)
                create(data)
            }
        })

        const cached = await cachedPromise
        if (cached) return create(cached)

        await eTagPromise
        if (!eTag) throw new Error('eTag unset somehow')
        const data = await this.downloadAndWriteDatabase(path, url, eTag)
        create(data)
    }

    private static async getCachedFile<T>(path: string, toJSON: boolean = false): Promise<T | undefined> {
        if (!this.inCache.has(path)) return
        const cached = this.cache[path]
        if (cached) return cached
        this.inCache.add(path)
        let data = await fs.promises.readFile(`${this.cacheDir}/${path}`)
        if (toJSON) data = JSON.parse(data.toString())
        this.cache[path] = data
        return data as T
    }
}
