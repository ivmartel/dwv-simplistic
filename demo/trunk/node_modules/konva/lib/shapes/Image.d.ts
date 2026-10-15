import type { ShapeConfig } from '../Shape.ts';
import { Shape } from '../Shape.ts';
import type { GetSet, IRect } from '../types.ts';
import type { Context } from '../Context.ts';
export interface ImageConfig extends ShapeConfig {
    image: CanvasImageSource | undefined;
    crop?: IRect;
    cornerRadius?: number | number[];
}
/**
 * Image constructor
 * @constructor
 * @memberof Konva
 * @augments Konva.Shape
 * @param {Object} config
 * @param {Image} config.image
 * @param {Object} [config.crop]
 * @@shapeParams
 * @@nodeParams
 * @example
 * var imageObj = new Image();
 * imageObj.onload = function() {
 *   var image = new Konva.Image({
 *     x: 200,
 *     y: 50,
 *     image: imageObj,
 *     width: 100,
 *     height: 100
 *   });
 * };
 * imageObj.src = '/path/to/image.jpg'
 */
export declare class Image extends Shape<ImageConfig> {
    private _loadListener;
    constructor(attrs?: ImageConfig);
    _setImageLoad(): void;
    _removeImageLoad(image: any): void;
    destroy(): this;
    _useBufferCanvas(forceFill?: boolean, opacity?: any): boolean;
    _getStrokePadding(): number;
    _sceneFunc(context: Context): void;
    _hitFunc(context: Context): void;
    getWidth(): any;
    getHeight(): any;
    /**
     * load image from given url and create `Konva.Image` instance
     * @method
     * @memberof Konva.Image
     * @param {String} url image source
     * @param {Function} callback with Konva.Image instance as first argument
     * @param {Function} onError optional error handler
     * @example
     *  Konva.Image.fromURL(imageURL, function(image){
     *    // image is Konva.Image instance
     *    layer.add(image);
     *  });
     */
    static fromURL(url: string, callback: (img: Image) => void, onError?: OnErrorEventHandler): void;
    image: GetSet<CanvasImageSource | undefined, this>;
    crop: GetSet<IRect, this>;
    cropX: GetSet<number, this>;
    cropY: GetSet<number, this>;
    cropWidth: GetSet<number, this>;
    cropHeight: GetSet<number, this>;
    cornerRadius: GetSet<number | number[], this>;
}
/**
 * get/set crop height
 * @name Konva.Image#cropHeight
 * @method
 * @param {Number} height
 * @returns {Number}
 * @example
 * // get crop height
 * var cropHeight = image.cropHeight();
 *
 * // set crop height
 * image.cropHeight(20);
 */
