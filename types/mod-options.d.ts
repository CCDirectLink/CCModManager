export type Enum = Record<string, number>;
/** Option that has state that can change */
export interface OptionChangeable {
    /** Does the option require a game restart to take effect */
    restart?: boolean;
    /** Option change callback */
    changeEvent?: (this: GuiOption) => void;
    /** Redraw the menu on option change */
    updateMenuOnChange?: boolean;
    /** Prevent the option from resetting the settings using the "Reset Settings" */
    preventResettingToDefault?: boolean;
}
/** A option entry */
export type Option = {
    /** Option display name */
    name?: ig.LangLabel.Data;
    /** Option description */
    description?: ig.LangLabel.Data;
    /** Is the option hidden from the menu */
    hidden?: boolean | (() => boolean);
} & (BUTTON_GROUP | ARRAY_SLIDER | OBJECT_SILDER | CHECKBOX | CONTROLS | INFO | BUTTON | JSON_DATA | INPUT_FIELD);
type BUTTON_GROUP = OptionChangeable & {
    type: 'BUTTON_GROUP';
    /** Initial option value */
    init: number;
    /** Button display names */
    buttonNames?: string[];
} & ({
    enum: Enum;
    group?: string[];
    data?: Record<string, number>;
} | {
    group: string[];
    data: Record<string, number>;
});
export type InputFieldIsValidFunc = (text: string) => boolean | Promise<boolean>;
interface INPUT_FIELD extends OptionChangeable {
    type: 'INPUT_FIELD';
    /** Initial option value */
    init: string;
    /** Input field height */
    height?: number;
    /** Validation function */
    isValid?: InputFieldIsValidFunc;
}
interface ARRAY_SLIDER extends OptionChangeable {
    type: 'ARRAY_SLIDER';
    data: number[];
    init: number;
    snap?: boolean;
    fill?: boolean;
}
type OBJECT_SILDER = OptionChangeable & {
    type: 'OBJECT_SLIDER';
    init: number;
    snap?: boolean;
    fill?: boolean;
    showPercentage?: boolean;
    /** Force the thumb width (values below 30 will be ignored) */
    thumbWidth?: number;
    customNumberDisplay?: (index: number) => number | string;
} & ({
    min: number;
    max: number;
    step: number;
    data?: Record<string, number>;
} | {
    data: Record<string, number>;
});
interface CHECKBOX extends OptionChangeable {
    type: 'CHECKBOX';
    init: boolean;
}
interface INFO {
    type: 'INFO';
}
interface BUTTON {
    type: 'BUTTON';
    onPress: (this: GuiOption) => void;
}
interface JSON_DATA extends OptionChangeable {
    type: 'JSON_DATA';
    init: any;
}
interface CONTROLS {
    type: 'CONTROLS';
    init: {
        key1: ig.KEY;
        key2?: ig.KEY;
    };
    pressEvent?: () => void;
    holdEvent?: () => void;
    /** If false, the keybinding only works in-game
     If true, the keybinding works everywhere */
    global?: boolean;
    data?: undefined;
}
export type GuiOption = Option & {
    id: string;
    baseId: string;
    modId: string;
    cat: string;
    header: string;
    hasDivider?: boolean;
    name: string;
    description: string;
};
export type Options = Record<string, Category>;
export interface Category {
    settings: CategorySettings;
    headers: CategoryOptions;
}
export type CategoryOptions = Record<string, Record<string, Option>>;
export interface CategorySettings {
    title: string;
    tabIcon?: string;
    helpMenu?: ModOptionsSettings['helpMenu'];
}
type FlattenOptions<T extends Options> = T extends Record<string, infer U> ? (U extends Category ? (U['headers'] extends Record<string, infer V extends Record<string, Record<string, unknown>>> ? {
    -readonly [K in keyof V]: K extends string ? (V[K] & {
        id: string;
    }) : never;
} : never) : never) : never;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type FlattenUnion<T> = {
    [K in keyof UnionToIntersection<T>]: UnionToIntersection<T>[K];
};
type FlatOpts<T extends Options> = FlattenUnion<FlattenOptions<T>>;
type OmitNonChangeableToUnion<E extends Options, F extends Record<string, any> = FlatOpts<E>> = {
    [T in keyof F]: F[T]['type'] extends 'BUTTON' ? never : F[T]['type'] extends 'INFO' ? never : F[T]['type'] extends 'CONTROLS' ? never : T extends string | number | bigint | boolean | null | undefined ? (F[T] & {
        key: `${T}`;
    }) : never;
}[keyof F];
type OmitNonChangeable<E extends Options, F = FlatOpts<E>, 
/** @ts-expect-error **/
O extends keyof F = OmitNonChangeableToUnion<E>['key']> = {
    [K in O]: F[K];
};
export type OptsType<E extends Options, O extends Record<string, any> = OmitNonChangeable<E>> = {
    [T in keyof O]: O[T]['type'] extends 'CHECKBOX' ? boolean : O[T]['type'] extends 'BUTTON_GROUP' ? O[T]['enum'][keyof O[T]['enum']] : O[T]['type'] extends 'JSON_DATA' ? Readonly<O[T]['init']> : O[T]['type'] extends 'INPUT_FIELD' ? string : number;
} & {
    flatOpts: FlatOpts<E>;
};
export declare namespace ModOptionsSettings {
    type LanguageGetter = (category: string, header: string, optionId: string, option: Option) => {
        name: string;
        description: string;
        buttonNames?: string[];
    };
}
export interface ModOptionsSettings {
    modId: string;
    title: string;
    helpMenu?: {
        title: string;
        pages: sc.MultiPageBoxGui.ConditionalPage[];
    };
    languageGetter?: ModOptionsSettings.LanguageGetter;
}
declare global {
    namespace modmanager {
        /** Contains the layouts used for displaying the mod options menu */
        var optionConfigs: Record<string, ModSettingsGui>;
        /** Contains the options objects for each registered mod. */
        var options: Record<string, Record<string, any>>;
        /** Register the mod options. Don't run it in preload to avoid race conditions, prestart and above is fine. */
        function registerAndGetModOptions<T extends Options>(settings: ModOptionsSettings, options: T): OptsType<T>;
    }
}
export type ModSettingsGui = {
    settings: ModOptionsSettings;
    structure: ModSettingsGuiStructure;
};
export type ModSettingsGuiStructure = Record<string, ModSettingsGuiStructureCategory>;
export type ModSettingsGuiStructureCategorySettings = CategorySettings;
export type ModSettingsGuiStructureCategory = {
    settings: ModSettingsGuiStructureCategorySettings;
    headers: Record<string, Record<string, GuiOption>>;
};
export declare const ObjectKeysT: <K extends string | number | symbol, V>(object: Record<K, V>) => K[];
export declare const ObjectEntriesT: <K extends string | number | symbol, V>(object: {
    [key in K]?: V;
}) => [K, V][];
export declare function modOptionsPrestart(): void;
export declare function modOptionsPoststart(): void;
export {};
