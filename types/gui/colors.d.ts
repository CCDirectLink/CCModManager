declare const COLOR: {
    readonly WHITE: 0;
    readonly RED: 1;
    readonly GREEN: 2;
    readonly YELLOW: 3;
};
export type Color = keyof typeof COLOR;
export declare function wrapInColor(color: Color, text: string | number): string;
export {};
