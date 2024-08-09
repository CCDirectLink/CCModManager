import type { Mod } from 'ultimate-crosscode-typedefs/modloader/mod'

import type { InstallMethod, PackageDB, ValidTags, ReleasePage } from 'ccmoddb/build/src/types'

export type Mod1 = Mod & {
    isCCModPacked: boolean
    findAllAssets?(): void /* only there for ccl2, used to set isCCL3 */
} & (
        | {
              isCCL3: true
              id: string
              findAllAssets(): void
          }
        | {
              isCCL3: false
              name: string
              filemanager: {
                  findFiles(dir: string, exts: string[]): Promise<string[]>
              }
              getAsset(path: string): string
              runtimeAssets: Record<string, string>
          }
    )

export type NPDatabase = PackageDB & { eTag: string }

export interface ModEntryBaseBase {
    /** A unique indentifier of a mod */
    id: string
    /** The title of the mod, non-unique */
    name: string
    /** The description of the mod */
    description?: string
    /** The version of the mod, always a proper semver */
    version: string
}

export interface ModEntryLocalVirtual extends ModEntryBaseBase {
    /** Determines if the virtual mod is an extension, for example post-dlc (the DLC) */
    isExtension?: boolean
}

interface ModEntryBase extends ModEntryBaseBase {
    /** The shortened database id, "LOCAL" if it's a local mod */
    database: string
    /** True if the mod doesn't have a ccmod.json, all server mods are not legacy */
    isLegacy: boolean
    /** Does the mod have a supported icon */
    hasIcon: boolean
    /** Copy of the dependencies from the mod manifest */
    dependencies: Record<string, string>
    /** True when the mod enabled state was changed, or the mod was updated */
    awaitingRestart?: boolean
    /** Mod repository web link */
    repositoryUrl?: string
}

export interface ModEntryServer extends ModEntryBase {
    isLocal: false
    /** The local counterpart of the same mod */
    localCounterpart?: ModEntryLocal
    /** Availible installation methods */
    installation: InstallMethod[]
    /** UNIX timestamp of the last commit of the primary git branch of the repostory provided by "repositoryUrl", fetched by CCModDB */
    lastUpdateTimestamp?: number
    /** Author list, may be empty */
    authors: string[]
    /** GitHub star count, local mods have this set if they have a server counterpart */
    stars?: number
    /** Represents the release page info fetched from the mods repository */
    releasePages?: ReleasePage[]
    /** Mod tag list */
    tags: ValidTags[]
    /** The testing counterpart */
    testingVersion?: ModEntryServer
    /* Dependency version requirements, cached by the installer */
    dependenciesCached?: Record<string, { mod: ModEntryServer; versionReqRanges: string[] }>
    /* Type of install operation to be performed, set by the mod installer. A dependency that needs an update has a status of "update" */
    installStatus?: 'new' | 'dependency' | 'update'
}

export interface ModEntryLocal extends ModEntryBase {
    isLocal: true
    /* Will the mod be loaded on next restart */
    active: boolean
    /* Config used for displaying the icon */
    iconConfig: ModImageConfig
    /** The server counterpart of the same mod */
    serverCounterpart?: ModEntryServer
    /** Mod path relavite to the main CrossCode directory */
    path: string
    /** Does the mod have a newer version available for installation */
    hasUpdate: boolean
    /** Has the mod been uninstalled in the current session */
    uninstalled?: boolean
    /** Never true for an ordinary mod, it's for stuff like CCLoader... Full list specified in local-mods.ts */
    disableUninstall?: boolean
    /** Never true for an ordinary mod, it's for stuff like CCLoader... Full list specified in local-mods.ts */
    disableDisabling?: boolean
    /** Never true for an ordinary mod, it's for stuff like CCLoader... Full list specified in local-mods.ts */
    disableUpdate?: boolean
    /** Is the mod installed manually by cloning it. You cannot uninstall or update these mods in the mod manager */
    isGit?: boolean
}

export type ModEntry = ModEntryServer | ModEntryLocal

export type ModImageConfig = {
    path: string
    offsetX: number
    offsetY: number
    sizeX: number
    sizeY: number
}

declare global {
    /* hack to mute a random rimraf error :) */
    type StringDecoder = {}
}
