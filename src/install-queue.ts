import { ModEntry } from './types'

export class InstallQueue {
    private static queue: Set<ModEntry> = new Set()
    static changeListeners: (() => void)[] = []

    private static changeUpdate() {
        this.changeListeners.forEach(f => f())
    }
    static add(mod: ModEntry) {
        this.queue.add(mod)
        this.changeUpdate()
    }
    static delete(mod: ModEntry) {
        this.queue.delete(mod)
        this.changeUpdate()
    }
    static has(mod: ModEntry) {
        return this.queue.has(mod)
    }
    static values(): ModEntry[] {
        return [...this.queue]
    }
}
