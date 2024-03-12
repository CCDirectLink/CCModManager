import { Mod } from 'ultimate-crosscode-typedefs/modloader/mod'

export {}
declare global {
    namespace sc {
        enum MENU_SUBMENU {
            MODS,
        }
        interface OptionsMenu {
            modsButton: sc.ButtonGui
        }
        interface CheckboxGui {
            crossedeyesLabel?: string
        }
        var modManagerAutoUpdate: boolean
    }
}

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

export type NPDatabase = Record<string, NPDatabasePackage> & { eTag: string }

export interface NPDatabasePackage {
    metadata?: NPDatabasePackageMetadata
    metadataCCMod?: NPDatabaseCCMod
    installation: NPDatabasePackageInstallation[]
    stars?: number
    lastUpdateTimestamp?: number
}

type LocalizedString = Record<string, string> | string

export interface NPDatabaseCCMod {
    id: string
    version?: string

    title?: LocalizedString
    description?: LocalizedString
    license?: string
    homepage?: string
    tags?: string[]
    authors?: string[] | string
    icons?: Record<string, string>

    dependencies?: Record<string, string>

    assetsDir?: string
    modPrefix?: string
}

export interface NPDatabasePackageMetadata {
    ccmodType?: 'base' | 'tool' /* so far only ccloader uses this */
    ccmodHumanName: string
    name: string
    version: string
    description?: string
    scripts?: Record<string, string>
    author?: string
    license?: string
    homepage?: string
    ccmodDependencies?: Record<string, string>
}

export type NPDatabasePackageInstallation = {
    url: string
    hash: { sha256: string }
} & {
    type: 'zip'
    source: string
}

interface ModEntryBase {
    database: string
    id: string
    name: string
    description?: string
    version: string
    isLegacy: boolean
    hasIcon: boolean
    dependencies: Record<string, string>
    stars?: number
    awaitingRestart?: boolean
}

export interface ModEntryServer extends ModEntryBase {
    isLocal: false
    localCounterpart?: ModEntryLocal
    installation: NPDatabasePackageInstallation[]
    lastUpdateTimestamp?: number
    authors: string[]
    tags: string[]

    dependenciesCached?: Record<string, { mod: ModEntryServer; versionReqRanges: string[] }> /* cached by the installer */
    installStatus?: 'new' | 'dependency' | 'update'
}

export interface ModEntryLocal extends ModEntryBase {
    isLocal: true
    active: boolean
    iconConfig: ModImageConfig
    serverCounterpart?: ModEntryServer
    path: string
    hasUpdate: boolean
    disableUninstall?: boolean
    disableDisabling?: boolean
    disableUpdate?: boolean
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
