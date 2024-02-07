const fs: typeof import('fs') = (0, eval)("require('fs')")
const path: typeof import('path') = (0, eval)("require('path')")

import jszip from 'jszip'
import { ModEntry, NPDatabase } from './types'

export class ModDB {
    modList!: NPDatabase

    async getMods(): Promise<ModEntry[]> {
        await this.downloadDatabase()

        const result = []
        for (const [name, data] of Object.entries(this.modList)) {
            result.push({
                id: name,
                name: data.metadata.ccmodHumanName || name,
                description: data.metadata.description,
                version: data.metadata.version,
                versionString: data.metadata.version,
            })
        }
        return result
    }

    async downloadMod(id: keyof NPDatabase) {
        const meta = await this.getMod(id)

        const installation = meta.installation.find(i => i.type === 'ccmod') || meta.installation.find(i => i.type === 'modZip')
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

    private async installCCMod(data: ArrayBuffer, id: keyof NPDatabase) {
        await fs.promises.writeFile(`assets/mods/${id}.ccmod`, new Uint8Array(data))
    }

    private async installModZip(data: ArrayBuffer, id: keyof NPDatabase, source: string) {
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
                        /* Directory already exists */
                    }
                    await fs.promises.writeFile(filepath, data)
                })
        )
    }

    private async getMod(id: keyof NPDatabase) {
        const data = this.modList[id]
        if (data) return data

        await this.downloadDatabase()
        const newData = this.modList[id]
        if (!newData) throw new Error('Could not find name')
        return newData
    }

    private async downloadDatabase() {
        const resp = await fetch('https://raw.githubusercontent.com/CCDirectLink/CCModDB/master/npDatabase.json')
        this.modList = (await resp.json()) as NPDatabase
    }
}
