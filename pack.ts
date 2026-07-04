#!/usr/bin/env bun
import { $, Glob } from 'bun'
import { Zippable, zipSync } from 'fflate'
import path from 'path'

import ccmod from './ccmod.json'

await $`rm -f ${ccmod.id}*`.nothrow().quiet()

await $`bun run build`

const tasks: Promise<void>[] = []
const zipFiles: Zippable = {}

async function addGlob(glob: string, minify?: boolean) {
    for await (const filePath of new Glob(glob).scan()) {
        if (filePath.endsWith('~') || filePath.endsWith('.kra')) continue
        if (filePath.endsWith('icon240.png')) continue

        tasks.push(
            (async () => {
                const file = Bun.file(filePath)

                let data: Uint8Array
                if (
                    minify &&
                    (filePath.endsWith('.json') ||
                        filePath.endsWith('.json.patch') ||
                        filePath.endsWith('.json.patch.confd'))
                ) {
                    data = new TextEncoder().encode(JSON.stringify(await file.json()))
                } else {
                    data = await file.bytes()
                }

                let obj = zipFiles
                for (const dirName of path.dirname(filePath).split(path.sep)) {
                    if (dirName == '.') continue
                    obj = (obj[dirName] ??= {}) as Zippable
                }
                obj[path.basename(filePath)] = data
                console.log('  adding: ', filePath)
            })()
        )
    }
}

await Promise.all([
    //
    addGlob('{LICENSE,plugin.js,ccmod.json}'),
    addGlob('icon/icon.png'),
    addGlob('{assets,lang}/**/*', true),
])
await Promise.all(tasks)

const zipData = zipSync(zipFiles)
const zipName = `${ccmod.id}-${ccmod.version}.ccmod`
await Bun.file(`./${zipName}`).write(zipData)
