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
                readonly repositoriesButton: {
                    readonly type: "BUTTON";
                    readonly onPress: (this: import("./mod-options").GuiOption) => void;
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
                    readonly init: true;
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
};
