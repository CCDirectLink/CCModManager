import { ModDB } from './moddb'
import { Option } from './mod-options'
import { Opts } from './options'

function isValidUrl(urlString: string) {
    if (urlString.includes('@') || urlString.includes('#')) return false
    if (urlString.startsWith('https://')) urlString = urlString.substring('https://'.length)
    if (urlString.startsWith('http://')) urlString = urlString.substring('http://'.length)

    const firstIndexOfSlash = urlString.indexOf('/')
    const host = firstIndexOfSlash == -1 ? urlString : urlString.substring(0, firstIndexOfSlash)

    return host.length > 1 && (host == 'localhost' || host.includes('.'))
}

function inputFieldKeys() {
    return Object.keys(Opts).filter(key => key.startsWith('inputFieldRepo'))
}

let noChange = false
export function repoChangeEvent(this: Option) {
    if (noChange) return
    ModDB.databases = {}

    for (const key of inputFieldKeys()) {
        // @ts-expect-error
        const url = Opts[key]
        if (!url) continue
        ModDB.addDatabase(new ModDB(url))
    }
    ModDB.saveDatabases()
}

export function modDatabasesToInputFields() {
    noChange = true
    const dbs = Object.values(ModDB.databases)
    const keys = inputFieldKeys()
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i] as 'inputFieldRepo0'
        const db = dbs[i]
        const value = db ? db.name : ''
        Opts[key] = value
    }
    noChange = false
}

export async function repoIsValid(this: Option, value: string) {
    if (value == '') return true

    let dbToCheck: ModDB
    if (value.startsWith('@')) {
        dbToCheck = new ModDB(value, false, false)
    } else {
        if (!isValidUrl(value)) {
            return false
        }
        dbToCheck = new ModDB(value, false, false)
    }
    return await dbToCheck.isUrlValid()
}
