import ModManager from './plugin'

export let semver: typeof import('semver')

export let JSZip: typeof import('jszip')

export async function initLibraries() {
    if (ModManager.mod.isCCL3) {
        semver = ccmod.semver as typeof import('semver')
        // @ts-expect-error
        JSZip = ccmod.jszip
    } else {
        // @ts-expect-error
        semver = window.semver
        // @ts-expect-error
        await import('/ccloader/js/lib/jszip.min.js').catch()
        // @ts-expect-error
        JSZip = window.JSZip
    }
}
