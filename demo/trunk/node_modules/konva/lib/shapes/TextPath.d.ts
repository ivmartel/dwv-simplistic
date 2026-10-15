import type { Context } from '../Context.ts';
import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import { Text } from './Text.ts';
import type { GetSet, PathSegment, Vector2d } from '../types.ts';
export interface TextPathConfig extends ShapeConfig {
    text?: string;
    data?: string;
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: string;
    fontVariant?: string;
    align?: string;
    letterSpacing?: number;
    textBaseline?: string;
    textDecoration?: string;
    direction?: string;
    kerningFunc?: (leftChar: string, rightChar: string) => number;
}
/**
 * Path constructor.
 * @author Jason Follas
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {String} [config.fontFamily] default is Arial
 * @param {Number} [config.fontSize] default is 12
 * @param {String} [config.fontStyle] Can be 'normal', 'italic', or 'bold', '500' or even 'italic bold'.  'normal' is the default.
 * @param {String} [config.fontVariant] can be normal or small-caps.  Default is normal
 * @param {String} [config.textBaseline] Can be 'top', 'bottom', 'middle', 'alphabetic', 'hanging'. Default is middle
 * @param {String} config.text
 * @param {String} config.data SVG data string
 * @param {Function} config.kerningFunc a getter for kerning values for the specified characters
 * @@shapeParams
 * @@nodeParams
 * @example
 * var kerningPairs = {
 *   'A': {
 *     ' ': -0.05517578125,
 *     'T': -0.07421875,
 *     'V': -0.07421875
 *   }
 *   'V': {
 *     ',': -0.091796875,
 *     ":": -0.037109375,
 *     ";": -0.037109375,
 *     "A": -0.07421875
 *   }
 * }
 * var textpath = new Konva.TextPath({
 *   x: 100,
 *   y: 50,
 *   fill: '#333',
 *   fontSize: '24',
 *   fontFamily: 'Arial',
 *   text: 'All the world\'s a stage, and all the men and women merely players.',
 *   data: 'M10,10 C0,0 10,150 100,100 S300,150 400,50',
 *   kerningFunc(leftChar, rightChar) {
 *     return kerningPairs.hasOwnProperty(leftChar) ? pairs[leftChar][rightChar] || 0 : 0
 *   }
 * });
 */
export declare class TextPath extends Shape<TextPathConfig> {
    dataArray: PathSegment[];
    glyphInfo: Array<{
        text: string;
        rotation: number;
        p0: Vector2d;
        p1: Vector2d;
        width: number;
    }>;
    partialText: string;
    pathLength: number;
    textWidth: number;
    textHeight: number;
    constructor(config?: TextPathConfig);
    _getTextPathLength(): number;
    _getPointAtLength(length: number, cursor?: {
        index: number;
        offset: number;
    }): {
        x: number;
        y: number;
    } | null;
    _readDataAttribute(): void;
    _sceneFunc(context: Context): void;
    _hitFunc(context: Context): void;
    /**
     * get text width in pixels
     * @method
     * @name Konva.TextPath#getTextWidth
     */
    getTextWidth(): number;
    getTextHeight(): number;
    setText(text: string): Text;
    _getContextFont(): string;
    _getTextSize(text: string): {
        width: number;
        height: number;
    };
    _setTextData(): null | undefined;
    getSelfRect(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    getStrokeScaleEnabled(): boolean;
    _getSelfRectForDrawing(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    fontFamily: GetSet<string, this>;
    fontSize: GetSet<number, this>;
    fontStyle: GetSet<string, this>;
    fontVariant: GetSet<string, this>;
    align: GetSet<string, this>;
    letterSpacing: GetSet<number, this>;
    text: GetSet<string, this>;
    data: GetSet<string, this>;
    kerningFunc: GetSet<(leftChar: string, rightChar: string) => number, this>;
    textBaseline: GetSet<string, this>;
    textDecoration: GetSet<string, this>;
    direction: GetSet<string, this>;
}
