const fs: typeof import('fs') = (0, eval)("require('fs')")
const path: typeof import('path') = (0, eval)("require('path')")

import jszip from 'jszip'
import { ModEntry, ModID, NPDatabase } from './types'
import { FileCache } from './cache'

export class ModDB {
    modList!: NPDatabase
    constructor(
        public name: string,
        public url: string
    ) {
        FileCache.addDatabase(name, url)
    }

    async getMods(): Promise<ModEntry[]> {
        const database = 'official'
        this.modList = await FileCache.getDatabase(database)

        const result = []
        for (const [name, data] of Object.entries(this.modList)) {
            const meta = data.metadata
            const ccmod = data.metadataCCMod
            result.push({
                database,
                id: name,
                name: ccmod?.title ? ig.LangLabel.getText(ccmod.title) : meta!.ccmodHumanName || name,
                description: ccmod?.description ? ig.LangLabel.getText(ccmod.description) : meta!.description,
                version: ccmod?.version || meta!.version,
                isLegacy: !ccmod,
                hasIcon: ccmod?.icons ? !!ccmod.icons['24'] : false,
            })
        }
        return result
    }

    async downloadMod(id: ModID) {
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
                        /* Directory already exists */
                    }
                    await fs.promises.writeFile(filepath, data)
                })
        )
    }

    private async getMod(id: ModID) {
        const data = this.modList[id]
        if (data) return data

        const newData = this.modList[id]
        if (!newData) throw new Error('Could not find name')
        return newData
    }
}
