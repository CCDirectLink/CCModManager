import { ModEntry } from './types'

import fuzzysort from 'fuzzysort'

export interface Fliters {
    name?: string
}

function doesFilterApply(_filters: Fliters, _mod: ModEntry) {
    return true
}

export function createFuzzyFilteredModList(filters: Fliters, mods: ModEntry[]): ModEntry[] {
    mods = mods.filter(mod => doesFilterApply(filters, mod))

    if (filters.name) {
        const results = fuzzysort.go(filters.name, mods, {
            keys: ['id', 'name', 'description', 'versionString'],
            scoreFn: a => {
                const id = a[0] ? a[0].score.map(-100, 0, 0, 1000) : 0
                const name = a[1] ? a[1].score.map(-100, 0, 0, 1000) : 0
                const description = a[2] ? a[2].score.map(-1000000, 0, 0, 700) : 0
                const version = a[3] ? a[3].score.map(-1000000, 0, 0, 700) : 0
                // console.log(id, name, description, version, a)
                return Math.max(id, name, description, version)
            },
            limit: 100 /* don't return more results than you need! */,
            threshold: 300 /* don't return bad results */,
        })
        mods = results.map(res => res.obj)
        console.log('------------')
        for (const res of results) {
            console.log(res.obj.name, res.score)
        }
        console.log('------------')
    }

    return mods
}
