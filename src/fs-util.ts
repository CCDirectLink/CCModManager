const fs: typeof import('fs') = window.require?.('fs')
const path: typeof import('path') = window.require?.('path')

export async function* getFilesRecursive(dir: string): AsyncIterable<string> {
    if (!fs) return
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
    for (const dirent of dirents) {
        const res = `${dir}/${dirent.name}`
        if (dirent.isDirectory()) {
            yield* getFilesRecursive(res)
        } else {
            yield res
        }
    }
}

export async function mkdirRecursive(dir: string) {
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
            if (err.code === 'ENOENT') {
                await mkdirRecursive(path.dirname(dir))
                await fs.promises.mkdir(dir)
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
