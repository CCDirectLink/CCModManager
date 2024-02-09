import { LocalMods } from './local-mods'
import { ModEntry } from './types'

import fuzzysort from 'fuzzysort'

export interface Fliters {
    name?: string
    includeLegacy?: boolean
    hasIcon?: boolean
    includeLocal?: boolean
}

function doesFilterApply(filters: Fliters, mod: ModEntry) {
    if (!filters.includeLegacy && mod.isLegacy) return false
    if (filters.hasIcon && !mod.hasIcon) return false
    if (!filters.includeLocal && !mod.isLocal /* we only want to exclude server entries of local mods */ && LocalMods.getAllRecord()[mod.id]) return false
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
                return Math.max(id, name, description, version)
            },
            limit: 100 /* don't return more results than you need! */,
            threshold: 300 /* don't return bad results */,
        })
        mods = results.map(res => res.obj)
    }

    return mods
}
