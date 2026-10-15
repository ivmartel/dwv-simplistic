import { Util } from "../Util.js";
import { Factory } from "../Factory.js";
import { Shape } from "../Shape.js";
import { _registerNode } from "../Global.js";
import { getNumberOrArrayOfNumbersValidator, getNumberValidator, } from "../Validators.js";
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
export class Image extends Shape {
    constructor(attrs) {
        super(attrs);
        this._loadListener = () => {
            this._requestDraw();
        };
        this.on('imageChange.konva', (props) => {
            this._removeImageLoad(props.oldVal);
            this._setImageLoad();
        });
        this._setImageLoad();
    }
    _setImageLoad() {
        var _a;
        const image = this.image();
        // A fresh `new Image()` with no src already reports complete === true,
        // so it still needs the listener.
        if (((image === null || image === void 0 ? void 0 : image.complete) && image.src) || (image === null || image === void 0 ? void 0 : image.readyState) >= 2) {
            return;
        }
        (_a = image === null || image === void 0 ? void 0 : image.addEventListener) === null || _a === void 0 ? void 0 : _a.call(image, 'videoWidth' in image ? 'loadeddata' : 'load', this._loadListener);
    }
    _removeImageLoad(image) {
        var _a;
        (_a = image === null || image === void 0 ? void 0 : image.removeEventListener) === null || _a === void 0 ? void 0 : _a.call(image, 'videoWidth' in image ? 'loadeddata' : 'load', this._loadListener);
    }
    destroy() {
        this._removeImageLoad(this.image());
        super.destroy();
        return this;
    }
    _useBufferCanvas(forceFill, opacity = this.getAbsoluteOpacity()) {
        if (this.attrs.perfectDrawEnabled === false)
            return false;
        const hasCornerRadius = !!this.cornerRadius();
        const hasShadow = this.hasShadow();
        if (hasCornerRadius && hasShadow) {
            return true;
        }
        return super._useBufferCanvas(true, opacity);
    }
    _getStrokePadding() {
        return super._getStrokePadding(this.strokeScaleEnabled() ? 1 : undefined);
    }
    _sceneFunc(context) {
        const width = this.getWidth();
        const height = this.getHeight();
        const cornerRadius = this.cornerRadius();
        const image = this.attrs.image;
        if (this.hasFill() || this.hasStroke() || cornerRadius) {
            context.beginPath();
            cornerRadius
                ? Util.drawRoundedRectPath(context, width, height, cornerRadius)
                : context.rect(0, 0, width, height);
            context.closePath();
            context.fillStrokeShape(this);
        }
        if (image) {
            if (cornerRadius) {
                context.clip();
            }
            const cropWidth = this.attrs.cropWidth;
            const cropHeight = this.attrs.cropHeight;
            if (cropWidth && cropHeight) {
                context.drawImage(image, this.cropX(), this.cropY(), cropWidth, cropHeight, 0, 0, width, height);
            }
            else {
                context.drawImage(image, 0, 0, width, height);
            }
        }
        // If you need to draw later, you need to execute save/restore
    }
    _hitFunc(context) {
        const width = this.width(), height = this.height(), cornerRadius = this.cornerRadius();
        context.beginPath();
        if (!cornerRadius) {
            context.rect(0, 0, width, height);
        }
        else {
            Util.drawRoundedRectPath(context, width, height, cornerRadius);
        }
        context.closePath();
        context.fillStrokeShape(this);
    }
    getWidth() {
        var _a, _b, _c;
        const image = this.image();
        return (_c = (_b = (_a = this.attrs.width) !== null && _a !== void 0 ? _a : image === null || image === void 0 ? void 0 : image.videoWidth) !== null && _b !== void 0 ? _b : image === null || image === void 0 ? void 0 : image.width) !== null && _c !== void 0 ? _c : 0;
    }
    getHeight() {
        var _a, _b, _c;
        const image = this.image();
        return (_c = (_b = (_a = this.attrs.height) !== null && _a !== void 0 ? _a : image === null || image === void 0 ? void 0 : image.videoHeight) !== null && _b !== void 0 ? _b : image === null || image === void 0 ? void 0 : image.height) !== null && _c !== void 0 ? _c : 0;
    }
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
    static fromURL(url, callback, onError = null) {
        const img = Util.createImageElement();
        img.onload = () => {
            img.onload = img.onerror = null;
            callback(new Image({ image: img }));
        };
        img.onerror = onError;
        img.crossOrigin = 'Anonymous';
        img.src = url;
    }
}
Image.prototype.className = 'Image';
Image.prototype._attrsAffectingSize = ['image'];
_registerNode(Image, true);
/**
 * get/set corner radius
 * @method
 * @name Konva.Image#cornerRadius
 * @param {Number} cornerRadius
 * @returns {Number}
 * @example
 * // get corner radius
 * var cornerRadius = image.cornerRadius();
 *
 * // set corner radius
 * image.cornerRadius(10);
 *
 * // set different corner radius values
 * // top-left, top-right, bottom-right, bottom-left
 * image.cornerRadius([0, 10, 20, 30]);
 */
Factory.addGetterSetter(Image, 'cornerRadius', 0, getNumberOrArrayOfNumbersValidator(4));
/**
 * get/set image source. It can be image, canvas or video element
 * @name Konva.Image#image
 * @method
 * @param {Object} image source
 * @returns {Object}
 * @example
 * // get value
 * var image = shape.image();
 *
 * // set value
 * shape.image(img);
 */
Factory.addGetterSetter(Image, 'image');
Factory.addComponentsGetterSetter(Image, 'crop', ['x', 'y', 'width', 'height']);
/**
 * get/set crop
 * @method
 * @name Konva.Image#crop
 * @param {Object} crop
 * @param {Number} crop.x
 * @param {Number} crop.y
 * @param {Number} crop.width
 * @param {Number} crop.height
 * @returns {Object}
 * @example
 * // get crop
 * var crop = image.crop();
 *
 * // set crop
 * image.crop({
 *   x: 20,
 *   y: 20,
 *   width: 20,
 *   height: 20
 * });
 */
Factory.addGetterSetter(Image, 'cropX', 0, getNumberValidator());
/**
 * get/set crop x
 * @method
 * @name Konva.Image#cropX
 * @param {Number} x
 * @returns {Number}
 * @example
 * // get crop x
 * var cropX = image.cropX();
 *
 * // set crop x
 * image.cropX(20);
 */
Factory.addGetterSetter(Image, 'cropY', 0, getNumberValidator());
/**
 * get/set crop y
 * @name Konva.Image#cropY
 * @method
 * @param {Number} y
 * @returns {Number}
 * @example
 * // get crop y
 * var cropY = image.cropY();
 *
 * // set crop y
 * image.cropY(20);
 */
Factory.addGetterSetter(Image, 'cropWidth', 0, getNumberValidator());
/**
 * get/set crop width
 * @name Konva.Image#cropWidth
 * @method
 * @param {Number} width
 * @returns {Number}
 * @example
 * // get crop width
 * var cropWidth = image.cropWidth();
 *
 * // set crop width
 * image.cropWidth(20);
 */
Factory.addGetterSetter(Image, 'cropHeight', 0, getNumberValidator());
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
