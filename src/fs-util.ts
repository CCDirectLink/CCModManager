const fs: typeof import('fs') = window.require?.('fs')
const path: typeof import('path') = window.require?.('path')

// this has to support this environment: (speedrunning branch)
// chromium : "66.0.3359.181"
// node : "10.1.0"
// node-webkit : "0.30.5"

export async function isDirectory(path: string) {
    return (await fs.promises.stat(path)).isDirectory()
}

export async function* getFilesRecursive(dir: string): AsyncIterable<string> {
    if (!fs) return
    const fileNames = await fs.promises.readdir(dir)
    for (const name of fileNames) {
        const subPath = `${dir}/${name}`
        if (await isDirectory(subPath)) {
            yield* getFilesRecursive(subPath)
        } else {
            yield subPath
        }
    }
}

export async function mkdirRecursive(dir: string, noRecurse?: boolean) {
    if (!fs) return
    try {
        await fs.promises.mkdir(dir)
    } catch (err) {
        if (typeof err == 'object' && err && 'code' in err) {
            if (err.code === 'EEXIST') {
                const stats = await fs.promises.stat(dir)
                if (!stats.isDirectory()) throw err
                return
            }
            if (!noRecurse && err.code === 'ENOENT') {
                await mkdirRecursive(path.dirname(dir))
                await mkdirRecursive(dir, true)
                return
            }
        }
        throw err
    }
}

let rimraf: ((path: string, fs: typeof import('fs'), callback: () => void) => void) | undefined
export async function removeDirRecursive(path: string) {
    if (!fs) return

    if (!rimraf) {
        // @ts-expect-error
        const imported = await import('rimraf')
        rimraf = imported.default
    }
    return new Promise<void>(resolve => rimraf!(path, fs, () => resolve()))
}

export async function fileExists(filePath: string) {
    try {
        await fs.promises.access(filePath, fs.constants.F_OK)
        return true
    } catch {
        return false
    }
}

export async function isDirGit(dirPath: string): Promise<boolean> {
    if (!fs || !dirPath.trim()) return false
    const stat = await fs.promises.stat(dirPath)
    if (!stat.isDirectory()) return false
    return await fileExists(path.join(dirPath, '.git'))
}

export const readFile = fs?.promises?.readFile ?? (() => {})
export const writeFile = fs?.promises?.writeFile ?? (() => {})
