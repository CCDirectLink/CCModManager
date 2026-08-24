const COLOR = {
    WHITE: 0,
    RED: 1,
    GREEN: 2,
    YELLOW: 3,
} as const
export type Color = keyof typeof COLOR

function colorString(color: Color): string {
    const colorNum = COLOR[color]
    return `\\c[${colorNum}]`
}

export function wrapInColor(color: Color, text: string | number): string {
    return colorString(color) + text.toString() + colorString('WHITE')
}
