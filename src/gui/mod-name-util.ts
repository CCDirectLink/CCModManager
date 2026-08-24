export function prepareModName(mod: { name: string }) {
    return mod.name
        .replace(/\\c\[\d]/g, '')
        .replace(/\\i\[[a-zA-Z0-9-_]*\]/g, '')
        .trim()
}
