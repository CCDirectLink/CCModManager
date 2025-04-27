import { ModDB } from './moddb'
import { Option } from './mod-options'
import { Opts } from './options'

/* https://www.freecodecamp.org/news/check-if-a-javascript-string-is-a-url/ */
function isValidUrl(urlString: string) {
    var urlPattern = new RegExp(
        '^(https?:\\/\\/)?' + // validate protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
            '(\\#[-a-z\\d_]*)?$',
        'i'
    ) // validate fragment locator
    return !!urlPattern.test(urlString)
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
