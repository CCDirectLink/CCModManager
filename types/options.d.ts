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
                    readonly onPress: () => void;
                };
                readonly repositories: {
                    readonly type: "JSON_DATA";
                    readonly init: string[];
                    readonly changeEvent: () => void;
                };
                readonly testingOptInMods: {
                    readonly type: "JSON_DATA";
                    readonly init: string[];
                };
                readonly isGrid: {
                    readonly type: "CHECKBOX";
                    readonly init: false;
                    readonly hidden: true;
                    readonly changeEvent: () => void;
                };
            };
        };
    };
};
