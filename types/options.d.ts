export declare const opts: {
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
export declare let Opts: ReturnType<typeof sc.modMenu.registerAndGetModOptions<typeof opts>>;
export declare function registerOpts(): void;
