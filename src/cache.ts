import { ModEntry, ModImageConfig as ModIconConfig, NPDatabase } from './types'

const fs: typeof import('fs') = (0, eval)("require('fs')")

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

export class FileCache {
    private static cacheDir: string

    private static inCache: Set<string>
    private static cache: Record<string, any> = {}
    private static databases: Record<string /* name */, string /* url */> = {}

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
        if (mod.hasIcon)
            return {
                path: await this.getIcon(mod),
                offsetX: 0,
                offsetY: 0,
                sizeX: 24,
                sizeY: 24,
            }
        return {
            path: 'media/gui/menu.png',
            offsetX: 536,
            offsetY: 160,
            sizeX: 24,
            sizeY: 24,
        }
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

    static async getDatabase(name: string): Promise<NPDatabase> {
        const path = `${name}.json`
        const cached = await this.getCachedFile<NPDatabase>(path, true)
        if (cached) return cached

        const url = `${this.databases[name]}/npDatabase.json`
        const data: NPDatabase = (this.cache[path] = await (await fetch(url)).json())
        fs.writeFile(`${this.cacheDir}/${path}`, JSON.stringify(data), () => {})
        this.inCache.add(path)
        return data
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
