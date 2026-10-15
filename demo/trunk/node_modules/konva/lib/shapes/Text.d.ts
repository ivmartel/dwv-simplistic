import type { Context, SceneContext } from '../Context.ts';
import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import type { GetSet } from '../types.ts';
export interface CharRenderProps {
    char: string;
    index: number;
    x: number;
    y: number;
    lineIndex: number;
    column: number;
    isLastInLine: boolean;
    width: number;
    context: Context;
}
export declare function getDecorationLineWidth(fontSize: number): number;
export declare function stringToArray(string: string): string[];
export interface TextConfig extends ShapeConfig {
    direction?: string;
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: string;
    fontVariant?: string;
    textDecoration?: string;
    underlineOffset?: number;
    align?: string;
    verticalAlign?: string;
    padding?: number;
    lineHeight?: number;
    letterSpacing?: number;
    wrap?: string;
    ellipsis?: boolean;
    charRenderFunc?: null | ((props: CharRenderProps) => void);
}
export declare function getDummyContext(): CanvasRenderingContext2D;
/**
 * Text constructor
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {String} [config.direction] default is inherit
 * @param {String} [config.fontFamily] default is Arial
 * @param {Number} [config.fontSize] in pixels.  Default is 12
 * @param {String} [config.fontStyle] can be 'normal', 'italic', or 'bold', '500' or even 'italic bold'.  'normal' is the default.
 * @param {String} [config.fontVariant] can be normal or small-caps.  Default is normal
 * @param {String} [config.textDecoration] can be line-through, underline or empty string. Default is empty string.
 * @param {Number} [config.underlineOffset] offset for underline line. Default is calculated based on font size.
 * @param {String} config.text
 * @param {String} [config.align] can be left, center, right or justify
 * @param {String} [config.verticalAlign] can be top, middle or bottom
 * @param {Number} [config.padding]
 * @param {Number} [config.lineHeight] default is 1
 * @param {String} [config.wrap] can be "word", "char", or "none". Default is word
 * @param {Boolean} [config.ellipsis] can be true or false. Default is false. If true, text that does not fit is cut and ends with "…". That needs a fixed height or wrap="none"
 * @@shapeParams
 * @@nodeParams
 * @example
 * var text = new Konva.Text({
 *   x: 10,
 *   y: 15,
 *   text: 'Simple Text',
 *   fontSize: 30,
 *   fontFamily: 'Calibri',
 *   fill: 'green'
 * });
 */
export declare class Text extends Shape<TextConfig> {
    textArr: Array<{
        text: string;
        width: number;
        lastInParagraph: boolean;
    }>;
    _partialText: string;
    _partialTextX: number;
    _partialTextY: number;
    _partialFillStyle?: string | CanvasGradient | CanvasPattern;
    _partialStrokeStyle?: string | CanvasGradient | CanvasPattern;
    textWidth: number;
    textHeight: number;
    _baselineShift: number;
    constructor(config?: TextConfig);
    _sceneFunc(context: SceneContext): void;
    _getTextTop(): number;
    _getUnderlineOffset(): number;
    getSelfRect(): import("../types.ts").IRect;
    _getSelfRectForDrawing(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    _hitFunc(context: Context): void;
    setText(text: string): this;
    getWidth(): any;
    getHeight(): any;
    /**
     * get pure text width without padding
     * @method
     * @name Konva.Text#getTextWidth
     * @returns {Number}
     */
    getTextWidth(): number;
    getTextHeight(): number;
    /**
     * measure string with the font of current text shape.
     * That method can't handle multiline text.
     * @method
     * @name Konva.Text#measureSize
     * @param {String} text text to measure
     * @returns {Object} { width , height } of measured text
     */
    measureSize(text: string): {
        actualBoundingBoxAscent: number;
        actualBoundingBoxDescent: number;
        actualBoundingBoxLeft: number;
        actualBoundingBoxRight: number;
        alphabeticBaseline: number;
        emHeightAscent: number;
        emHeightDescent: number;
        fontBoundingBoxAscent: number;
        fontBoundingBoxDescent: number;
        hangingBaseline: number;
        ideographicBaseline: number;
        width: number;
        height: number;
    };
    _getContextFont(): string;
    _addTextLine(line: string): number;
    _getTextWidth(text: string, graphemes?: number): number;
    _setTextData(): void;
    /**
     * whether to handle ellipsis, there are two cases:
     * 1. the current line is the last line
     * 2. wrap is NONE
     * @param {Number} currentHeightPx
     * @returns {Boolean}
     */
    _shouldHandleEllipsis(currentHeightPx: number): boolean;
    _tryToAddEllipsisToLastLine(): void;
    getStrokeScaleEnabled(): boolean;
    _getStrokePadding(): number;
    _useBufferCanvas(forceFill?: boolean, opacity?: any): boolean;
    direction: GetSet<string, this>;
    fontFamily: GetSet<string, this>;
    fontSize: GetSet<number, this>;
    fontStyle: GetSet<string, this>;
    fontVariant: GetSet<string, this>;
    align: GetSet<string, this>;
    letterSpacing: GetSet<number, this>;
    verticalAlign: GetSet<string, this>;
    padding: GetSet<number, this>;
    lineHeight: GetSet<number, this>;
    textDecoration: GetSet<string, this>;
    underlineOffset: GetSet<number, this>;
    text: GetSet<string, this>;
    wrap: GetSet<string, this>;
    ellipsis: GetSet<boolean, this>;
    charRenderFunc: GetSet<null | ((props: CharRenderProps) => void), this>;
    width: GetSet<number, this, number | 'auto' | null | undefined>;
    height: GetSet<number, this, number | 'auto' | null | undefined>;
}
