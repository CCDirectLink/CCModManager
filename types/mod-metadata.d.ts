import type { Mod1 } from './types';
import ccmod from '../ccmod.json';
interface ModMetadata {
    manifest: typeof ccmod;
    dir: string;
    isCCModPacked: boolean;
    mod: Mod1;
}
export declare let modMetadata: ModMetadata;
export declare function setModMetadata(mod: Mod1): void;
export {};
