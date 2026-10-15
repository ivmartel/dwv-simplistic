import type { Context } from '../Context.ts';
import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import { Animation } from '../Animation.ts';
import type { GetSet } from '../types.ts';
export interface SpriteConfig extends ShapeConfig {
    animation: string;
    animations: any;
    frameIndex?: number;
    image: HTMLImageElement;
    frameRate?: number;
}
/**
 * Sprite constructor
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {String} config.animation animation key
 * @param {Object} config.animations animation map
 * @param {Integer} [config.frameIndex] animation frame index
 * @param {Image} config.image image object
 * @param {Integer} [config.frameRate] animation frame rate
 * @@shapeParams
 * @@nodeParams
 * @example
 * var imageObj = new Image();
 * imageObj.onload = function() {
 *   var sprite = new Konva.Sprite({
 *     x: 200,
 *     y: 100,
 *     image: imageObj,
 *     animation: 'standing',
 *     animations: {
 *       standing: [
 *         // x, y, width, height (6 frames)
 *         0, 0, 49, 109,
 *         52, 0, 49, 109,
 *         105, 0, 49, 109,
 *         158, 0, 49, 109,
 *         210, 0, 49, 109,
 *         262, 0, 49, 109
 *       ],
 *       kicking: [
 *         // x, y, width, height (6 frames)
 *         0, 109, 45, 98,
 *         45, 109, 45, 98,
 *         95, 109, 63, 98,
 *         156, 109, 70, 98,
 *         229, 109, 60, 98,
 *         287, 109, 41, 98
 *       ]
 *     },
 *     frameRate: 7,
 *     frameIndex: 0
 *   });
 * };
 * imageObj.src = '/path/to/image.jpg'
 */
export declare class Sprite extends Shape<SpriteConfig> {
    _updated: boolean;
    anim: Animation;
    interval: any;
    constructor(config: SpriteConfig);
    _getFrame(): {
        x: any;
        y: any;
        width: any;
        height: any;
        offsetX: any;
        offsetY: any;
    } | undefined;
    _getStrokePadding(): number;
    _sceneFunc(context: Context): void;
    _hitFunc(context: Context): void;
    getSelfRect(): {
        x: any;
        y: any;
        width: any;
        height: any;
    };
    _useBufferCanvas(forceFill?: boolean, opacity?: any): boolean;
    _setInterval(): void;
    /**
     * start sprite animation
     * @method
     * @name Konva.Sprite#start
     */
    start(): void;
    /**
     * stop sprite animation
     * @method
     * @name Konva.Sprite#stop
     */
    stop(): void;
    destroy(): this;
    /**
     * determine if animation of sprite is running or not.  returns true or false
     * @method
     * @name Konva.Sprite#isRunning
     * @returns {Boolean}
     */
    isRunning(): boolean;
    _updateIndex(): void;
    frameIndex: GetSet<number, this>;
    animation: GetSet<string, this>;
    image: GetSet<CanvasImageSource, this>;
    animations: GetSet<any, this>;
    frameOffsets: GetSet<any, this>;
    frameRate: GetSet<number, this>;
}
