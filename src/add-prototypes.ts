export {}
declare global {
    interface Object {
        keysT<K extends string | number | symbol, V>(object: Record<K, V>): K[]
        entriesT<K extends string | number | symbol, V>(object: { [key in K]?: V }): [K, V][]
    }
}

Object.keysT = Object.keys as any
Object.entriesT = Object.entries as any
