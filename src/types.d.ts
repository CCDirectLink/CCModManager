import { Mod } from 'ultimate-crosscode-typedefs/modloader/mod'

import type { InstallMethod, PackageDB } from 'ccmoddb/build/src/types'

export {}
declare global {
    namespace sc {
        enum MENU_SUBMENU {
            MODS,
        }
        interface OptionsMenu {
            modsButton: sc.ButtonGui
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

export type NPDatabase = PackageDB & { eTag: string }

export interface ModEntryBaseBase {
    id: string
    name: string
    description?: string
    version: string
}

export interface ModEntryLocalVirtual extends ModEntryBaseBase {
    isExtension?: boolean
}

interface ModEntryBase extends ModEntryBaseBase {
    database: string
    isLegacy: boolean
    hasIcon: boolean
    dependencies: Record<string, string>
    stars?: number
    awaitingRestart?: boolean
}

export interface ModEntryServer extends ModEntryBase {
    isLocal: false
    localCounterpart?: ModEntryLocal
    installation: InstallMethod[]
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
