import { Mod } from 'ultimate-crosscode-typedefs/modloader/mod'

export {}
declare global {
    namespace sc {
        enum MENU_SUBMENU {
            MODS,
        }
        interface TitleScreenButtonGui {
            modsButton: sc.ButtonGui

            _enterModsMenu(this: this): void
        }
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

export type ModID = string
export type NPDatabase = Record<ModID, NPDatabasePackage> & { eTag: string }

export interface NPDatabasePackage {
    metadata?: NPDatabasePackageMetadata
    metadataCCMod?: NPDatabaseCCMod
    installation: NPDatabasePackageInstallation[]
    stars?: number
}

type LocalizedString = Record<string, string> | string

type Person = PersonDetails | string
interface PersonDetails {
    name: LocalizedString
    email?: LocalizedString
    url?: LocalizedString
    comment?: LocalizedString
}

export interface NPDatabaseCCMod {
    id: string
    version?: string

    title?: LocalizedString
    description?: LocalizedString
    license?: string
    homepage?: string
    keywords?: string[]
    authors?: Person[]
    icons?: Record<string, string>
    type?: 'mod' | 'library'

    dependencies?: Record<ModID, string>

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
}

export type NPDatabasePackageInstallation = {
    url: string
    hash: { sha256: string }
} & (
    | {
          type: 'modZip'
          source: string
      }
    | {
          type: 'ccmod'
      }
)

export type ModEntry = {
    database: string
    id: ModID
    name: string
    description?: string
    version: string
    isLegacy: boolean
    hasIcon: boolean
    stars?: number
}

export type ModImageConfig = {
    path: string
    offsetX: number
    offsetY: number
    sizeX: number
    sizeY: number
}
