import type { IRect } from './types.ts';
import type { Context } from './Context.ts';
interface ICanvasConfig {
    width?: number;
    height?: number;
    pixelRatio?: number;
    willReadFrequently?: boolean;
}
/**
 * Canvas Renderer constructor. It is a wrapper around native canvas element.
 * Usually you don't need to use it manually.
 * @constructor
 * @abstract
 * @memberof Konva
 * @param {Object} config
 * @param {Number} config.width
 * @param {Number} config.height
 * @param {Number} config.pixelRatio
 */
export declare class Canvas {
    pixelRatio: number;
    _canvas: HTMLCanvasElement;
    context: Context;
    width: number;
    height: number;
    _logicalWidth: number;
    _logicalHeight: number;
    isCache: boolean;
    constructor(config: ICanvasConfig);
    /**
     * get canvas context
     * @method
     * @name Konva.Canvas#getContext
     * @returns {CanvasContext} context
     */
    getContext(): Context;
    /**
     * get pixel ratio
     * @method
     * @name Konva.Canvas#getPixelRatio
     * @returns {Number} pixel ratio
     * @example
     * var pixelRatio = layer.getCanvas().getPixelRatio();
     */
    getPixelRatio(): number;
    /**
     * set pixel ratio
     * KonvaJS automatically handles pixel ratio adustments in order to render crisp drawings
     *  on all devices. Most desktops, low end tablets, and low end phones, have device pixel ratios
     *  of 1.  Some high end tablets and phones, like iPhones and iPads have a device pixel ratio
     *  of 2.  Some Macbook Pros, and iMacs also have a device pixel ratio of 2.  Some high end Android devices have pixel
     *  ratios of 2 or 3.  Some browsers like Firefox allow you to configure the pixel ratio of the viewport.  Unless otherwise
     *  specificed, the pixel ratio will be defaulted to the actual device pixel ratio.  You can override the device pixel
     *  ratio for special situations, or, if you don't want the pixel ratio to be taken into account, you can set it to 1.
     * @method
     * @name Konva.Canvas#setPixelRatio
     * @param {Number} pixelRatio
     * @example
     * layer.getCanvas().setPixelRatio(3);
     */
    setPixelRatio(pixelRatio: any): void;
    setWidth(width: any): void;
    setHeight(height: any): void;
    getWidth(): number;
    getHeight(): number;
    _bitmapSize(size: number): number;
    setSize(width: any, height: any): void;
    setSizeIfChanged(width: number, height: number): void;
    /**
     * to data url
     * @method
     * @name Konva.Canvas#toDataURL
     * @param {String} mimeType
     * @param {Number} quality between 0 and 1 for jpg mime types
     * @returns {String} data url string
     */
    toDataURL(mimeType: any, quality: any): string;
}
export declare class SceneCanvas extends Canvas {
    private _isolationCanvas?;
    _isolationRect?: IRect;
    private _isolationPeak;
    private _isolationLowFrames;
    _prepareIsolationCanvas(rect?: IRect): SceneCanvas;
    _trimIsolationCanvas(): void;
    _releaseIsolationCanvas(): void;
    setSize(width: any, height: any): void;
    constructor(config?: ICanvasConfig);
}
export declare class HitCanvas extends Canvas {
    hitCanvas: boolean;
    constructor(config?: ICanvasConfig);
}
export {};
