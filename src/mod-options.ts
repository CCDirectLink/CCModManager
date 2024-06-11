export type Enum = Record<string, number>

export interface OptionChangeable {
    restart?: boolean
    changeEvent?: () => void
    updateMenuOnChange?: boolean
}

// prettier-ignore
export type Option = {
    name?: ig.LangLabel.Data
    description?: ig.LangLabel.Data

    hidden?: boolean | (() => boolean)
} & (
    | BUTTON_GROUP
    | ARRAY_SLIDER
    | OBJECT_SILDER
    | CHECKBOX
    | CONTROLS
    | INFO
    | BUTTON
    | JSON_DATA
)

type BUTTON_GROUP = OptionChangeable & {
    type: 'BUTTON_GROUP'
    init: number
    buttonNames?: string[]
} & (
        | {
              enum: Enum
              group?: string[]
              data?: Record<string, number>
          }
        | {
              group: string[]
              data: Record<string, number>
          }
    )

interface ARRAY_SLIDER extends OptionChangeable {
    type: 'ARRAY_SLIDER'
    data: number[]
    init: number
    snap?: boolean
    fill?: boolean
}

type OBJECT_SILDER = OptionChangeable & {
    type: 'OBJECT_SLIDER'
    init: number
    snap?: boolean
    fill?: boolean
    showPercentage?: boolean

    customNumberDisplay?: (index: number) => number | string
} & (
        | {
              min: number
              max: number
              step: number
              data?: Record<string, number>
          }
        | {
              data: Record<string, number>
          }
    )

interface CHECKBOX extends OptionChangeable {
    type: 'CHECKBOX'
    init: boolean
}

interface INFO {
    type: 'INFO'
}

interface BUTTON {
    type: 'BUTTON'
    onPress: () => void
}

interface JSON_DATA extends OptionChangeable {
    type: 'JSON_DATA'
    init: any
}

interface CONTROLS {
    type: 'CONTROLS'
    init: { key1: ig.KEY; key2?: ig.KEY }

    pressEvent?: () => void
    holdEvent?: () => void
    global?: boolean

    data?: undefined /* typescript is mad for some reason when i remove this line */
}
/* options types end */

export type GuiOption = Option & {
    id: string
    baseId: string
    modId: string
    cat: string
    header: string
    hasDivider?: boolean

    name: string
    description: string
}

export type Options = Record<string, Category>

export interface Category {
    settings: CategorySettings
    headers: CategoryOptions
}
export type CategoryOptions = Record<string, Record<string, Option>>
export interface CategorySettings {
    title: string
    tabIcon?: string
    helpMenu?: ModOptionsSettings['helpMenu']
}

// prettier-ignore
type FlattenOptions<T extends Options> =
    T extends Record<string, infer U>
    ? (U extends Category
        ? (U['headers'] extends Record<string, infer V extends Record<string, Record<string, unknown>>>
            ? { -readonly [K in keyof V]: K extends string ? (V[K] & { id: string }) : never }
            : never)
        : never)
    : never

// prettier-ignore
type UnionToIntersection<U> = (U extends any 
    ? (k: U) => void
    : never) extends ((k: infer I) => void)
    ? I
    : never

type FlattenUnion<T> = {
    [K in keyof UnionToIntersection<T>]: UnionToIntersection<T>[K]
}

type FlatOpts<T extends Options> = FlattenUnion<FlattenOptions<T>>

// prettier-ignore
type OmitNonChangeableToUnion<E extends Options, F extends Record<string, any> = FlatOpts<E>> = {
    [T in keyof F]: 
          F[T]['type'] extends 'BUTTON' ? never
        : F[T]['type'] extends 'INFO' ? never
        : F[T]['type'] extends 'CONTROLS' ? never
        // @ts-expect-error
        : F[T] & { key: `${T}` }
    }[keyof F]

type OmitNonChangeable<
    E extends Options,
    F = FlatOpts<E>,
    // @ts-expect-error
    O extends keyof F = OmitNonChangeableToUnion<E>['key'],
> = {
    [K in O]: F[K]
}

type Writable<T> = {
    -readonly [P in keyof T]: T[P]
}

// prettier-ignore
export type OptsType<E extends Options, O extends Record<string, any> = OmitNonChangeable<E>> = {
    [T in keyof O]: 
          O[T]['type'] extends 'CHECKBOX' ? boolean
        : O[T]['type'] extends 'BUTTON_GROUP' ? O[T]['enum'][keyof O[T]['enum']]
        : O[T]['type'] extends 'JSON_DATA' ? Writable<O[T]['init']>
    
        : number
    } & { flatOpts: FlatOpts<E> }

export namespace ModOptionsSettings {
    export type LanguageGetter = (category: string, header: string, optionId: string, option: Option) => { name: string; description: string; buttonNames?: string[] }
}
export interface ModOptionsSettings {
    modId: string
    title: string
    helpMenu?: {
        title: string
        pages: sc.MultiPageBoxGui.ConditionalPage[]
    }
    languageGetter?: ModOptionsSettings.LanguageGetter
}

const defaultLanguageGetter: ModOptionsSettings.LanguageGetter = (category, header, optionId, option) => {
    const lang = (localStorage.getItem('IG_LANG') as ig.LANGUAGE_UNION) ?? 'en_US'
    const def: string = `${category}-${header}-${optionId}`

    function get(data: ig.LangLabel.Data | undefined) {
        if (data === undefined) return def
        if (typeof data === 'string') return data
        return data[lang] ?? data['en_US'] ?? (Object.values(data)[0] as string)
    }
    return {
        name: get(option.name),
        description: get(option.description),
    }
}

declare global {
    namespace sc {
        var modMenu: {
            optionConfigs: Record<string, ModSettingsGui>
            options: Record<string, Record<string, any>>

            registerAndGetModOptions<T extends Options>(settings: ModOptionsSettings, options: T): OptsType<T>
        }
    }
}

export type ModSettingsGui = {
    settings: ModOptionsSettings
    structure: ModSettingsGuiStructure
}
export type ModSettingsGuiStructure = Record<string, ModSettingsGuiStructureCategory>
export type ModSettingsGuiStructureCategorySettings = CategorySettings
export type ModSettingsGuiStructureCategory = {
    settings: ModSettingsGuiStructureCategorySettings
    headers: Record<string, Record<string, GuiOption>>
}

/* stolen from game.compiled.js because it hasn't executed yet */
Number.prototype.round = function (this: number, decimalPlaces?: number) {
    decimalPlaces = Math.pow(10, decimalPlaces || 0)
    return Math.round(this * decimalPlaces) / decimalPlaces
}

export const ObjectKeysT: <K extends string | number | symbol, V>(object: Record<K, V>) => K[] = Object.keys as any
export const ObjectEntriesT: <K extends string | number | symbol, V>(object: { [key in K]?: V }) => [K, V][] = Object.entries as any

window.sc ??= {} as any
sc.modMenu ??= {} as any
sc.modMenu.options ??= {} as any
sc.modMenu.optionConfigs ??= {} as any

const controlsToSet: (GuiOption & { type: 'CONTROLS' })[] = []

sc.modMenu.registerAndGetModOptions = registerAndGetModOptions
function registerAndGetModOptions<T extends Options>(settings: ModOptionsSettings, options: T): OptsType<T> {
    const Opts: OptsType<T> = {} as any
    Opts.flatOpts = {} as any

    const guiStructure: ModSettingsGuiStructure = {}
    sc.modMenu.optionConfigs[settings.modId] = {
        settings,
        structure: guiStructure,
    }

    const languageGetter = settings.languageGetter ?? defaultLanguageGetter

    ObjectEntriesT(options).forEach(([catKey, category]) => {
        const guiStructureCategorySettings: ModSettingsGuiStructureCategorySettings = category.settings

        const guiStructureCategory = (guiStructure[catKey] ??= {
            settings: guiStructureCategorySettings,
            headers: {},
        })

        const headers = category.headers
        ObjectEntriesT(headers).forEach(([headerKey, optionEntries]) => {
            const guiStructureHeader = (guiStructureCategory.headers[headerKey] ??= {})

            let isFirstOption: boolean = true
            ;(ObjectEntriesT(optionEntries) as [keyof FlatOpts<T>, Option][]).forEach(([optKey, option], optKeyI) => {
                const id = (option.type == 'CONTROLS' ? 'keys-' : '') + `${settings.modId}-${optKey as string}`

                /* register gui option */
                const guiOption: GuiOption = Object.assign(option, {
                    id,
                    baseId: optKey.toString(),
                    modId: settings.modId,
                    cat: catKey,
                    init: 'init' in option ? option.init : undefined,
                    header: headerKey,
                    hasDivider: isFirstOption,
                    ...languageGetter(catKey, headerKey, optKey as string, option),
                })
                if (guiOption.type != 'INFO') isFirstOption = false

                // @ts-expect-error
                Opts.flatOpts[optKey] = guiOption

                if (guiOption.type == 'OBJECT_SLIDER') {
                    if (!guiOption.data) {
                        const data: Record<number, number> = {}
                        for (let i = guiOption.min, h = 0; i.round(2) <= guiOption.max; i += guiOption.step, h++) {
                            data[h] = i.round(2)
                        }
                        guiOption.data = data
                    }
                } else if (guiOption.type == 'BUTTON_GROUP') {
                    if (!guiOption.data) {
                        guiOption.data = guiOption.enum
                        guiOption.group = Object.keys(guiOption.enum)
                    }
                }

                guiStructureHeader[optKeyI] = guiOption
                /* register gui option end */

                if (guiOption.type == 'CONTROLS') controlsToSet.push(guiOption)

                if (guiOption.type != 'CONTROLS' && guiOption.type != 'INFO' && guiOption.type != 'BUTTON') {
                    const get = function (pure?: boolean) {
                        let v = localStorage.getItem(id)!
                        if (pure) return v
                        if (option.type == 'CHECKBOX') return v == 'true'
                        if (option.type == 'JSON_DATA') return JSON.parse(v)
                        return Number(v)
                    }
                    const set = function (v: object | string | number, noEvent?: boolean) {
                        const str = typeof v === 'object' ? JSON.stringify(v) : v.toString()
                        localStorage.setItem(id, str)
                        if (!noEvent && 'changeEvent' in option && option.changeEvent) option.changeEvent()
                        if (!noEvent && 'updateMenuOnChange' in option && option.updateMenuOnChange && sc.menu?.currentMenu == sc.MENU_SUBMENU?.MOD_OPTIONS) {
                            sc.modOptionsMenu.reopenMenu()
                        }
                    }

                    Object.defineProperty(Opts, optKey, { get, set })

                    if (get(true) === null) {
                        set(guiOption.init, true)
                    }
                }
            })
        })
    })

    sc.modMenu.options[settings.modId] = Opts
    return Opts
}

export function modOptionsPrestart() {
    sc.CrossCode.inject({
        init() {
            /* register the keybindings right before sc.KeyBinder#initKeybindings steps in */
            for (const controlConfig of controlsToSet) {
                sc.OPTIONS_DEFINITION[controlConfig.id] = controlConfig as any
            }
            this.parent()
        },
    })
}
export function modOptionsPoststart() {
    ig.game.addons.preUpdate.push({
        onPreUpdate() {
            const isInGame = sc.model.currentState == sc.GAME_MODEL_STATE.GAME && ig.interact.entries.length == 0
            for (const controlConfig of controlsToSet) {
                if (!controlConfig.global && !isInGame) continue
                const id = controlConfig.id.substring('keys-'.length)
                if (controlConfig.pressEvent && ig.input.pressed(id)) {
                    controlConfig.pressEvent()
                }
                if (controlConfig.holdEvent && ig.input.state(id)) {
                    controlConfig.holdEvent()
                }
            }
        },
    })
}
