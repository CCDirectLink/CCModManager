import { modMetadata } from './mod-metadata'

export let semver: typeof import('semver')

export async function initLibraries() {
    if (modMetadata.mod.isCCL3) {
        semver = ccmod.semver as typeof import('semver')
    } else {
        // @ts-expect-error
        semver = window.semver
    }
}
