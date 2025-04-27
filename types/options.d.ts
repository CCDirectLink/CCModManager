import { repoChangeEvent, repoIsValid } from './repo-add';
export declare let Opts: ReturnType<typeof modmanager.registerAndGetModOptions<ReturnType<typeof registerOpts>>>;
export declare function registerOpts(): {
    readonly general: {
        readonly settings: {
            readonly tabIcon: "general";
            readonly title: "General";
        };
        readonly headers: {
            readonly general: {
                readonly autoUpdate: {
                    readonly type: "CHECKBOX";
                    readonly init: true;
                };
                readonly testingOptInMods: {
                    readonly type: "JSON_DATA";
                    readonly init: string[];
                };
                readonly isGrid: {
                    readonly type: "CHECKBOX";
                    readonly init: false;
                    readonly hidden: true;
                    readonly changeEvent: (this: import("./mod-options").GuiOption) => void;
                };
                readonly hideLibraryMods: {
                    readonly type: "CHECKBOX";
                    readonly init: false;
                    readonly hidden: true;
                    readonly changeEvent: (this: import("./mod-options").GuiOption) => void;
                };
                readonly includeLocalModsInOnline: {
                    readonly type: "CHECKBOX";
                    readonly init: true;
                    readonly hidden: true;
                    readonly changeEvent: (this: import("./mod-options").GuiOption) => void;
                };
                readonly manualEnforcerRead: {
                    readonly type: "JSON_DATA";
                    readonly init: Record<string, boolean>;
                    readonly preventResettingToDefault: true;
                };
            };
            readonly advanced: {
                readonly unpackCCMods: {
                    readonly type: "CHECKBOX";
                    readonly init: false;
                };
                readonly keepChromiumFlags: {
                    readonly type: "CHECKBOX";
                    readonly init: true;
                };
                readonly ignoreCCLoaderMajorVersion: {
                    readonly type: "CHECKBOX";
                    readonly init: false;
                };
                readonly clearCacheButton: {
                    readonly type: "BUTTON";
                    readonly onPress: (this: import("./mod-options").GuiOption) => void;
                };
                readonly reinstallAllMods: {
                    readonly type: "BUTTON";
                    readonly onPress: (this: import("./mod-options").GuiOption) => void;
                };
            };
        };
    };
    readonly repositories: {
        readonly settings: {
            readonly tabIcon: "interface";
            readonly title: "Repositories";
        };
        readonly headers: {
            readonly repositories: {
                readonly inputFieldRepo0: {
                    type: "INPUT_FIELD";
                    init: string;
                    changeEvent: typeof repoChangeEvent;
                    isValid: typeof repoIsValid;
                };
                readonly inputFieldRepo1: {
                    type: "INPUT_FIELD";
                    init: string;
                    changeEvent: typeof repoChangeEvent;
                    isValid: typeof repoIsValid;
                };
                readonly inputFieldRepo2: {
                    type: "INPUT_FIELD";
                    init: string;
                    changeEvent: typeof repoChangeEvent;
                    isValid: typeof repoIsValid;
                };
                readonly inputFieldRepo3: {
                    type: "INPUT_FIELD";
                    init: string;
                    changeEvent: typeof repoChangeEvent;
                    isValid: typeof repoIsValid;
                };
                readonly inputFieldRepo4: {
                    type: "INPUT_FIELD";
                    init: string;
                    changeEvent: typeof repoChangeEvent;
                    isValid: typeof repoIsValid;
                };
                readonly inputFieldRepo5: {
                    type: "INPUT_FIELD";
                    init: string;
                    changeEvent: typeof repoChangeEvent;
                    isValid: typeof repoIsValid;
                };
                readonly inputFieldRepo6: {
                    type: "INPUT_FIELD";
                    init: string;
                    changeEvent: typeof repoChangeEvent;
                    isValid: typeof repoIsValid;
                };
                readonly resetRepositoriesButton: {
                    readonly type: "BUTTON";
                    readonly onPress: (this: import("./mod-options").GuiOption) => void;
                };
                readonly repositories: {
                    readonly type: "JSON_DATA";
                    readonly init: string[];
                    readonly changeEvent: (this: import("./mod-options").GuiOption) => void;
                };
            };
        };
    };
};
