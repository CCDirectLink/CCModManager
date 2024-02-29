import en_US from '../lang/en_US.json';
type LangType = typeof en_US;
export declare let Lang: LangType;
export declare class LangManager {
    constructor();
    poststart(): Promise<void>;
}
export {};
