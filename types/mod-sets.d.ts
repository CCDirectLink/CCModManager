import type { ModEntryServer } from './types';
export interface SetConfig extends ModEntryServer {
}
export declare class ModSets {
    static getConfigs(): SetConfig[];
}
