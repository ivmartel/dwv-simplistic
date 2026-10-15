import { Transform, Util } from "./Util.js";
import { Konva } from "./Global.js";
function simplifyArray(arr) {
    const retArr = [], len = arr.length, util = Util;
    for (let n = 0; n < len; n++) {
        let val = arr[n];
        if (util._isNumber(val)) {
            val = Math.round(val * 1000) / 1000;
        }
        else if (!util._isString(val)) {
            val = val + '';
        }
        retArr.push(val);
    }
    return retArr;
}
const COMMA = ',', OPEN_PAREN = '(', CLOSE_PAREN = ')', SEMICOLON = ';', DOUBLE_PAREN = '()', 
// EMPTY_STRING = '',
EQUALS = '=', 
// SET = 'set',
CONTEXT_METHODS = [
    'arc',
    'arcTo',
    'beginPath',
    'bezierCurveTo',
    'clearRect',
    'clip',
    'closePath',
    'createLinearGradient',
    'createPattern',
    'createRadialGradient',
    'drawImage',
    'ellipse',
    'fill',
    'fillText',
    'getImageData',
    'createImageData',
    'lineTo',
    'moveTo',
    'putImageData',
    'quadraticCurveTo',
    'rect',
    'roundRect',
    'restore',
    'rotate',
    'save',
    'scale',
    'setLineDash',
    'setTransform',
    'stroke',
    'strokeText',
    'transform',
    'translate',
];
const CONTEXT_PROPERTIES = [
    'fillStyle',
    'strokeStyle',
    'shadowColor',
    'shadowBlur',
    'shadowOffsetX',
    'shadowOffsetY',
    'letterSpacing',
    'lineCap',
    'lineDashOffset',
    'lineJoin',
    'lineWidth',
    'miterLimit',
    'direction',
    'font',
    'textAlign',
    'textBaseline',
    'globalAlpha',
    'globalCompositeOperation',
    'imageSmoothingEnabled',
    'imageSmoothingQuality',
    'filter',
];
const traceArrMax = 100;
// Check if CSS filters are supported in the current browser
let _cssFiltersSupported = null;
export function isCSSFiltersSupported() {
    if (_cssFiltersSupported !== null) {
        return _cssFiltersSupported;
    }
    try {
        const canvas = Util.createCanvasElement();
        const ctx = canvas.getContext('2d');
        _cssFiltersSupported = !!ctx && 'filter' in ctx;
        Util.releaseCanvas(canvas);
    }
    catch (e) {
        _cssFiltersSupported = false;
    }
    return _cssFiltersSupported;
}
/**
 * Konva wrapper around native 2d canvas context. It has almost the same API of 2d context with some additional functions.
 * With core Konva shapes you don't need to use this object. But you will use it if you want to create
 * a [custom shape](/docs/react/Custom_Shape.html) or a [custom hit regions](/docs/events/Custom_Hit_Region.html).
 * For full information about each 2d context API use [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
 * @constructor
 * @memberof Konva
 * @example
 * const rect = new Konva.Shape({
 *    fill: 'red',
 *    width: 100,
 *    height: 100,
 *    sceneFunc: (ctx, shape) => {
 *      // ctx - is context wrapper
 *      // shape - is instance of Konva.Shape, so it equals to "rect" variable
 *      ctx.rect(0, 0, shape.getAttr('width'), shape.getAttr('height'));
 *
 *      // automatically fill shape from props and draw hit region
 *      ctx.fillStrokeShape(shape);
 *    }
 * })
 */
export class Context {
    constructor(canvas) {
        this.canvas = canvas;
        if (Konva.enableTrace) {
            this.traceArr = [];
            this._enableTrace();
        }
    }
    /**
     * fill shape
     * @method
     * @name Konva.Context#fillShape
     * @param {Konva.Shape} shape
     */
    fillShape(shape) {
        if (shape.fillEnabled()) {
            this._fill(shape);
        }
    }
    _fill(shape) {
        // abstract
    }
    /**
     * stroke shape
     * @method
     * @name Konva.Context#strokeShape
     * @param {Konva.Shape} shape
     */
    strokeShape(shape) {
        if (shape.hasStroke()) {
            this._stroke(shape);
        }
    }
    _stroke(shape) {
        // abstract
    }
    /**
     * fill then stroke
     * @method
     * @name Konva.Context#fillStrokeShape
     * @param {Konva.Shape} shape
     */
    fillStrokeShape(shape) {
        if (shape.attrs.fillAfterStrokeEnabled) {
            this.strokeShape(shape);
            this.fillShape(shape);
        }
        else {
            this.fillShape(shape);
            this.strokeShape(shape);
        }
    }
    getTrace(relaxed, rounded) {
        let traceArr = this.traceArr, len = traceArr.length, str = '', n, trace, method, args;
        for (n = 0; n < len; n++) {
            trace = traceArr[n];
            method = trace.method;
            // methods
            if (method) {
                args = trace.args;
                str += method;
                if (relaxed) {
                    str += DOUBLE_PAREN;
                }
                else {
                    if (rounded) {
                        args = args.map((a) => (typeof a === 'number' ? Math.floor(a) : a));
                    }
                    str += OPEN_PAREN + args.join(COMMA) + CLOSE_PAREN;
                }
            }
            else {
                // properties
                str += trace.property;
                if (!relaxed) {
                    str += EQUALS + trace.val;
                }
            }
            str += SEMICOLON;
        }
        return str;
    }
    clearTrace() {
        this.traceArr = [];
    }
    _trace(str) {
        let traceArr = this.traceArr, len;
        traceArr.push(str);
        len = traceArr.length;
        if (len >= traceArrMax) {
            traceArr.shift();
        }
    }
    /**
     * reset canvas context transform
     * @method
     * @name Konva.Context#reset
     */
    reset() {
        const pixelRatio = this.getCanvas().getPixelRatio();
        this.setTransform(1 * pixelRatio, 0, 0, 1 * pixelRatio, 0, 0);
    }
    /**
     * get canvas wrapper
     * @method
     * @name Konva.Context#getCanvas
     * @returns {Konva.Canvas}
     */
    getCanvas() {
        return this.canvas;
    }
    /**
     * clear canvas
     * @method
     * @name Konva.Context#clear
     * @param {Object} [bounds]
     * @param {Number} [bounds.x]
     * @param {Number} [bounds.y]
     * @param {Number} [bounds.width]
     * @param {Number} [bounds.height]
     */
    clear(bounds) {
        const canvas = this.getCanvas();
        if (bounds) {
            this.clearRect(bounds.x || 0, bounds.y || 0, bounds.width || 0, bounds.height || 0);
        }
        else {
            this.clearRect(0, 0, canvas.getWidth() / canvas.pixelRatio, canvas.getHeight() / canvas.pixelRatio);
        }
    }
    // Copy a buffer already rasterized in destination pixels. The caller owns
    // save/restore, opacity, compositing and the destination clip.
    _drawDeviceBuffer(canvas) {
        const { x, y, width, height } = canvas._isolationRect;
        this.setTransform(1, 0, 0, 1, 0, 0);
        this.imageSmoothingEnabled = false;
        this.drawImage(canvas._canvas, 0, 0, width, height, x, y, width, height);
    }
    _applyLineCap(shape) {
        const lineCap = shape.attrs.lineCap;
        if (lineCap) {
            this.setAttr('lineCap', lineCap);
        }
    }
    _getOpacity(shape) {
        if (!this._opacityRoot) {
            return shape.getAbsoluteOpacity();
        }
        let opacity = shape.opacity();
        let parent = shape.parent;
        while (parent && parent !== this._opacityRoot) {
            opacity *= parent.opacity();
            parent = parent.parent;
        }
        return opacity;
    }
    _applyOpacity(shape) {
        const absOpacity = this._getOpacity(shape);
        if (absOpacity !== 1) {
            this.setAttr('globalAlpha', absOpacity);
        }
    }
    _applyLineJoin(shape) {
        const lineJoin = shape.attrs.lineJoin;
        if (lineJoin) {
            this.setAttr('lineJoin', lineJoin);
        }
    }
    _applyMiterLimit(shape) {
        const miterLimit = shape.attrs.miterLimit;
        if (miterLimit != null) {
            this.setAttr('miterLimit', miterLimit);
        }
    }
    setAttr(attr, val) {
        this._context[attr] = val;
    }
    /**
     * arc function.
     * @method
     * @name Konva.Context#arc
     */
    arc(x, y, radius, startAngle, endAngle, counterClockwise) {
        this._context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
    }
    /**
     * arcTo function.
     * @method
     * @name Konva.Context#arcTo
     *
     */
    arcTo(x1, y1, x2, y2, radius) {
        this._context.arcTo(x1, y1, x2, y2, radius);
    }
    /**
     * beginPath function.
     * @method
     * @name Konva.Context#beginPath
     */
    beginPath() {
        this._context.beginPath();
    }
    /**
     * bezierCurveTo function.
     * @method
     * @name Konva.Context#bezierCurveTo
     */
    bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
        this._context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    }
    /**
     * clearRect function.
     * @method
     * @name Konva.Context#clearRect
     */
    clearRect(x, y, width, height) {
        this._context.clearRect(x, y, width, height);
    }
    clip(...args) {
        this._context.clip.apply(this._context, args);
    }
    /**
     * closePath function.
     * @method
     * @name Konva.Context#closePath
     */
    closePath() {
        this._context.closePath();
    }
    /**
     * createImageData function.
     * @method
     * @name Konva.Context#createImageData
     */
    createImageData(width, height) {
        const a = arguments;
        if (a.length === 2) {
            return this._context.createImageData(width, height);
        }
        else if (a.length === 1) {
            return this._context.createImageData(width);
        }
    }
    /**
     * createLinearGradient function.
     * @method
     * @name Konva.Context#createLinearGradient
     */
    createLinearGradient(x0, y0, x1, y1) {
        return this._context.createLinearGradient(x0, y0, x1, y1);
    }
    /**
     * createPattern function.
     * @method
     * @name Konva.Context#createPattern
     */
    createPattern(image, repetition) {
        return this._context.createPattern(image, repetition);
    }
    /**
     * createRadialGradient function.
     * @method
     * @name Konva.Context#createRadialGradient
     */
    createRadialGradient(x0, y0, r0, x1, y1, r1) {
        return this._context.createRadialGradient(x0, y0, r0, x1, y1, r1);
    }
    /**
     * drawImage function.
     * @method
     * @name Konva.Context#drawImage
     */
    drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
        // this._context.drawImage(...arguments);
        const a = arguments, _context = this._context;
        if (a.length === 3) {
            _context.drawImage(image, sx, sy);
        }
        else if (a.length === 5) {
            _context.drawImage(image, sx, sy, sWidth, sHeight);
        }
        else if (a.length === 9) {
            _context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        }
    }
    /**
     * ellipse function.
     * @method
     * @name Konva.Context#ellipse
     */
    ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise) {
        this._context.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise);
    }
    /**
     * isPointInPath function.
     * @method
     * @name Konva.Context#isPointInPath
     */
    isPointInPath(x, y, path, fillRule) {
        if (path) {
            return this._context.isPointInPath(path, x, y, fillRule);
        }
        return this._context.isPointInPath(x, y, fillRule);
    }
    fill(...args) {
        // this._context.fill();
        this._context.fill.apply(this._context, args);
    }
    /**
     * fillRect function.
     * @method
     * @name Konva.Context#fillRect
     */
    fillRect(x, y, width, height) {
        this._context.fillRect(x, y, width, height);
    }
    /**
     * strokeRect function.
     * @method
     * @name Konva.Context#strokeRect
     */
    strokeRect(x, y, width, height) {
        this._context.strokeRect(x, y, width, height);
    }
    /**
     * fillText function.
     * @method
     * @name Konva.Context#fillText
     */
    fillText(text, x, y, maxWidth) {
        if (maxWidth) {
            this._context.fillText(text, x, y, maxWidth);
        }
        else {
            this._context.fillText(text, x, y);
        }
    }
    /**
     * measureText function.
     * @method
     * @name Konva.Context#measureText
     */
    measureText(text) {
        return this._context.measureText(text);
    }
    /**
     * getImageData function.
     * @method
     * @name Konva.Context#getImageData
     */
    getImageData(sx, sy, sw, sh) {
        return this._context.getImageData(sx, sy, sw, sh);
    }
    /**
     * lineTo function.
     * @method
     * @name Konva.Context#lineTo
     */
    lineTo(x, y) {
        this._context.lineTo(x, y);
    }
    /**
     * moveTo function.
     * @method
     * @name Konva.Context#moveTo
     */
    moveTo(x, y) {
        this._context.moveTo(x, y);
    }
    /**
     * rect function.
     * @method
     * @name Konva.Context#rect
     */
    rect(x, y, width, height) {
        this._context.rect(x, y, width, height);
    }
    /**
     * roundRect function.
     * @method
     * @name Konva.Context#roundRect
     */
    roundRect(x, y, width, height, radii) {
        this._context.roundRect(x, y, width, height, radii);
    }
    /**
     * putImageData function.
     * @method
     * @name Konva.Context#putImageData
     */
    putImageData(imageData, dx, dy) {
        this._context.putImageData(imageData, dx, dy);
    }
    /**
     * quadraticCurveTo function.
     * @method
     * @name Konva.Context#quadraticCurveTo
     */
    quadraticCurveTo(cpx, cpy, x, y) {
        this._context.quadraticCurveTo(cpx, cpy, x, y);
    }
    /**
     * restore function.
     * @method
     * @name Konva.Context#restore
     */
    restore() {
        this._context.restore();
    }
    /**
     * rotate function.
     * @method
     * @name Konva.Context#rotate
     */
    rotate(angle) {
        this._context.rotate(angle);
    }
    /**
     * save function.
     * @method
     * @name Konva.Context#save
     */
    save() {
        this._context.save();
    }
    /**
     * scale function.
     * @method
     * @name Konva.Context#scale
     */
    scale(x, y) {
        this._context.scale(x, y);
    }
    /**
     * setLineDash function.
     * @method
     * @name Konva.Context#setLineDash
     */
    setLineDash(segments) {
        this._context.setLineDash(segments);
    }
    /**
     * getLineDash function.
     * @method
     * @name Konva.Context#getLineDash
     */
    getLineDash() {
        return this._context.getLineDash();
    }
    /**
     * setTransform function.
     * @method
     * @name Konva.Context#setTransform
     */
    setTransform(a, b, c, d, e, f) {
        this._context.setTransform(a, b, c, d, e, f);
    }
    /**
     * stroke function.
     * @method
     * @name Konva.Context#stroke
     */
    stroke(path2d) {
        if (path2d) {
            this._context.stroke(path2d);
        }
        else {
            this._context.stroke();
        }
    }
    /**
     * strokeText function.
     * @method
     * @name Konva.Context#strokeText
     */
    strokeText(text, x, y, maxWidth) {
        this._context.strokeText(text, x, y, maxWidth);
    }
    /**
     * transform function.
     * @method
     * @name Konva.Context#transform
     */
    transform(a, b, c, d, e, f) {
        this._context.transform(a, b, c, d, e, f);
    }
    /**
     * translate function.
     * @method
     * @name Konva.Context#translate
     */
    translate(x, y) {
        this._context.translate(x, y);
    }
    _enableTrace() {
        let that = this, len = CONTEXT_METHODS.length, origSetter = this.setAttr, n, args;
        // to prevent creating scope function at each loop
        const func = function (methodName) {
            let origMethod = that[methodName], ret;
            that[methodName] = function () {
                args = simplifyArray(Array.prototype.slice.call(arguments, 0));
                ret = origMethod.apply(that, arguments);
                that._trace({
                    method: methodName,
                    args: args,
                });
                return ret;
            };
        };
        // methods
        for (n = 0; n < len; n++) {
            func(CONTEXT_METHODS[n]);
        }
        // attrs
        that.setAttr = function () {
            origSetter.apply(that, arguments);
            const prop = arguments[0];
            let val = arguments[1];
            if (prop === 'shadowOffsetX' ||
                prop === 'shadowOffsetY' ||
                prop === 'shadowBlur') {
                val = val / this.canvas.getPixelRatio();
            }
            that._trace({
                property: prop,
                val: val,
            });
        };
    }
    _applyGlobalCompositeOperation(node) {
        const op = node.attrs.globalCompositeOperation;
        const def = !op || op === 'source-over';
        if (!def) {
            this.setAttr('globalCompositeOperation', op);
        }
    }
}
CONTEXT_PROPERTIES.forEach(function (prop) {
    Object.defineProperty(Context.prototype, prop, {
        get() {
            return this._context[prop];
        },
        set(val) {
            this._context[prop] = val;
        },
    });
});
export class SceneContext extends Context {
    constructor(canvas, { willReadFrequently = false } = {}) {
        super(canvas);
        this._context = canvas._canvas.getContext('2d', {
            willReadFrequently,
        });
    }
    _getFillPattern(shape) {
        // node-canvas exposes pattern smoothing through patternQuality.
        const context = this._context;
        if ('patternQuality' in context) {
            context.patternQuality = context.imageSmoothingEnabled
                ? 'good'
                : 'nearest';
        }
        return shape._getFillPattern();
    }
    _getFillStyle(shape) {
        const color = shape.fill();
        const priority = shape.fillPriority();
        if (color && priority === 'color')
            return color;
        const pattern = shape.fillPatternImage();
        if (pattern && priority === 'pattern')
            return this._getFillPattern(shape);
        const linear = shape.fillLinearGradientColorStops();
        if (linear && priority === 'linear-gradient')
            return shape._getLinearGradient();
        const radial = shape.fillRadialGradientColorStops();
        if (radial && priority === 'radial-gradient')
            return shape._getRadialGradient();
        if (color)
            return color;
        if (pattern)
            return this._getFillPattern(shape);
        if (linear)
            return shape._getLinearGradient();
        if (radial)
            return shape._getRadialGradient();
    }
    _fill(shape) {
        const style = this._getFillStyle(shape);
        if (style !== undefined) {
            this.setAttr('fillStyle', style);
            shape._fillFunc(this);
        }
    }
    _strokeLinearGradient(shape) {
        let start = shape.getStrokeLinearGradientStartPoint(), end = shape.getStrokeLinearGradientEndPoint();
        if (!shape.getStrokeScaleEnabled()) {
            const { a, b, c, d, e, f } = this._context.getTransform();
            const transform = new Transform([a, b, c, d, e, f]);
            const ratio = this.canvas.getPixelRatio();
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            // Gradient colors follow the inverse-transposed direction. Transforming
            // the endpoints alone distorts them under skew or nonuniform scaling.
            const nx = d * dx - b * dy;
            const ny = a * dy - c * dx;
            const lengthSquared = nx * nx + ny * ny;
            const scale = lengthSquared
                ? ((dx * dx + dy * dy) * (a * d - b * c)) / lengthSquared
                : 0;
            start = transform.point(start);
            end = { x: start.x + nx * scale, y: start.y + ny * scale };
            start = { x: start.x / ratio, y: start.y / ratio };
            end = { x: end.x / ratio, y: end.y / ratio };
        }
        const colorStops = shape.getStrokeLinearGradientColorStops(), grd = this.createLinearGradient(start.x, start.y, end.x, end.y);
        if (colorStops) {
            // build color stops
            for (let n = 0; n < colorStops.length; n += 2) {
                grd.addColorStop(colorStops[n], colorStops[n + 1]);
            }
            this.setAttr('strokeStyle', grd);
        }
    }
    _applyStrokeStyle(shape) {
        if (shape.strokeLinearGradientColorStops()) {
            this._strokeLinearGradient(shape);
        }
        else {
            this.setAttr('strokeStyle', shape.stroke());
        }
    }
    _stroke(shape) {
        const dash = shape.dash(), 
        // ignore strokeScaleEnabled for Text
        strokeScaleEnabled = shape.getStrokeScaleEnabled();
        if (!strokeScaleEnabled) {
            this.save();
        }
        this._applyLineCap(shape);
        if (dash && shape.dashEnabled()) {
            this.setLineDash(dash);
            this.setAttr('lineDashOffset', shape.dashOffset());
        }
        this.setAttr('lineWidth', shape.strokeWidth());
        const shadowColor = this.shadowColor;
        const shadowForStrokeEnabled = shape.getShadowForStrokeEnabled();
        if (!shadowForStrokeEnabled) {
            this.setAttr('shadowColor', 'rgba(0,0,0,0)');
        }
        this._applyStrokeStyle(shape);
        // Resolve the gradient in local coordinates before drawing an unscaled stroke.
        if (!strokeScaleEnabled) {
            const pixelRatio = this.getCanvas().getPixelRatio();
            this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        }
        try {
            shape._strokeFunc(this);
        }
        finally {
            if (!shadowForStrokeEnabled) {
                this.setAttr('shadowColor', shadowColor);
            }
            if (!strokeScaleEnabled) {
                this.restore();
            }
        }
    }
    _applyShadow(shape) {
        var _a;
        const color = (_a = shape.getShadowRGBA()) !== null && _a !== void 0 ? _a : 'black', blur = shape.getShadowBlur(), offset = shape.getShadowOffset(), scale = shape.getAbsoluteScale(), ratio = this.canvas.getPixelRatio(), scaleX = scale.x * ratio, scaleY = scale.y * ratio;
        this.setAttr('shadowColor', color);
        this.setAttr('shadowBlur', blur * Math.min(Math.abs(scaleX), Math.abs(scaleY)));
        this.setAttr('shadowOffsetX', offset.x * scaleX);
        this.setAttr('shadowOffsetY', offset.y * scaleY);
    }
}
export class HitContext extends Context {
    constructor(canvas) {
        super(canvas);
        this._context = canvas._canvas.getContext('2d', {
            willReadFrequently: true,
        });
    }
    _fill(shape) {
        this.save();
        this.setAttr('fillStyle', shape.colorKey);
        shape._fillFuncHit(this);
        this.restore();
    }
    strokeShape(shape) {
        if (shape.hasHitStroke()) {
            this._stroke(shape);
        }
    }
    _stroke(shape) {
        // ignore strokeScaleEnabled for Text
        const strokeScaleEnabled = shape.getStrokeScaleEnabled();
        if (!strokeScaleEnabled) {
            this.save();
            const pixelRatio = this.getCanvas().getPixelRatio();
            this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        }
        this._applyLineCap(shape);
        const hitStrokeWidth = shape.hitStrokeWidth();
        const strokeWidth = hitStrokeWidth === 'auto' ? shape.strokeWidth() : hitStrokeWidth;
        this.setAttr('lineWidth', strokeWidth);
        this.setAttr('strokeStyle', shape.colorKey);
        shape._strokeFuncHit(this);
        if (!strokeScaleEnabled) {
            this.restore();
        }
    }
}
