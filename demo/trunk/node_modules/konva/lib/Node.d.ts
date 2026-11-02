import type { Canvas } from './Canvas.ts';
import { HitCanvas, SceneCanvas } from './Canvas.ts';
import type { Container } from './Container.ts';
import type { Context } from './Context.ts';
import type { Layer } from './Layer.ts';
import type { Shape } from './Shape.ts';
import type { Stage } from './Stage.ts';
import type { Tween, TweenConfig } from './Tween.ts';
import type { GetSet, IRect, Vector2d } from './types.ts';
import { Transform, type AnyString } from './Util.ts';
export type FilterFunction = (this: Node, imageData: ImageData, pixelRatio?: number) => void;
export type Filter = FilterFunction | string;
type Filters = Array<FilterFunction | string>;
type SubtreeObserver = {
    _onSubtreeChange(node: Node): void;
};
type globalCompositeOperationType = '' | 'source-over' | 'source-in' | 'source-out' | 'source-atop' | 'destination-over' | 'destination-in' | 'destination-out' | 'destination-atop' | 'lighter' | 'copy' | 'xor' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
export type NodeConfig = {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    visible?: boolean;
    listening?: boolean;
    id?: string;
    name?: string;
    opacity?: number;
    scale?: Vector2d;
    scaleX?: number;
    skewX?: number;
    skewY?: number;
    scaleY?: number;
    rotation?: number;
    rotationDeg?: number;
    offset?: Vector2d;
    offsetX?: number;
    offsetY?: number;
    draggable?: boolean;
    dragDistance?: number;
    dragBoundFunc?: (this: Node, pos: Vector2d, evt: any) => Vector2d;
    preventDefault?: boolean;
    globalCompositeOperation?: globalCompositeOperationType;
    filters?: Filters;
    [string: string]: any;
};
type NodeEventMap = GlobalEventHandlersEventMap & {
    [index: string]: any;
};
export interface KonvaEventObject<EventType, This = Node> {
    type: string;
    target: Shape | Stage;
    evt: EventType;
    pointerId: number;
    currentTarget: This;
    cancelBubble: boolean;
    child?: Node;
    oldVal?: any;
    newVal?: any;
}
export interface GetClientRectConfig {
    _forDrawing?: boolean;
    skipTransform?: boolean;
    skipShadow?: boolean;
    skipStroke?: boolean;
    relativeTo?: Node;
}
export type KonvaEventListener<This, EventType> = (this: This, ev: KonvaEventObject<EventType, This>) => void;
export type CanvasConfig = {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    pixelRatio?: number;
    imageSmoothingEnabled?: boolean;
};
export type ImageConfig = CanvasConfig & {
    mimeType?: string;
    quality?: number;
};
/**
 * Node constructor. Nodes are entities that can be transformed, layered,
 * and have bound events. The stage, layers, groups, and shapes all extend Node.
 * @constructor
 * @memberof Konva
 * @param {Object} config
 * @@nodeParams
 */
export declare abstract class Node<Config extends NodeConfig = NodeConfig> {
    _id: number;
    eventListeners: {
        [index: string]: Array<{
            name: string;
            handler: Function;
        }>;
    };
    attrs: any;
    index: number;
    parent: Container | null;
    _cache: Record<string, any>;
    _canvasCache: {
        scene: SceneCanvas;
        filter: SceneCanvas;
        hit: HitCanvas | null;
        hitConfig: {
            pixelRatio: number;
            width: number;
            height: number;
        };
        x: number;
        y: number;
    } | null;
    _attrsAffectingSize: string[];
    _attrsVersion?: number;
    _subtreeObservers?: Set<SubtreeObserver>;
    static _subtreeObserverCount: number;
    _batchingTransformChange: boolean;
    _needClearTransformCache: boolean;
    _filterUpToDate: boolean;
    _isUnderCache: boolean;
    nodeType: string;
    className: string;
    _dragEventId: number | null;
    _shouldFireChangeEvents: boolean;
    constructor(config?: Config);
    hasChildren(): boolean;
    _clearCache(attr?: string): void;
    _releaseCanvasCache(): void;
    _getCache(attr: string, privateGetter: Function): any;
    _getCanvasCache(): {
        scene: SceneCanvas;
        filter: SceneCanvas;
        hit: HitCanvas | null;
        hitConfig: {
            pixelRatio: number;
            width: number;
            height: number;
        };
        x: number;
        y: number;
    } | null;
    _clearSelfAndDescendantCache(attr?: string): void;
    static _updateBatchDepth: number;
    static _pendingUpdates: Set<() => void>;
    static _runAfterUpdateBatch(cb: () => void): void;
    static _flushUpdateBatch(): void;
    static _updateBatch<T>(fn: () => T): T;
    static _beginUpdateBatch(): () => void;
    /**
     * clear cached canvas
     * @method
     * @name Konva.Node#clearCache
     * @returns {Konva.Node}
     * @example
     * node.clearCache();
     */
    clearCache(): this;
    /**
     *  cache node to improve drawing performance, apply filters, or create more accurate
     *  hit regions. For all basic shapes size of cache canvas will be automatically detected.
     *  If you need to cache your custom `Konva.Shape` instance you have to pass shape's bounding box
     *  properties. Look at [https://konvajs.org/docs/performance/Shape_Caching.html](https://konvajs.org/docs/performance/Shape_Caching.html) for more information.
     * @method
     * @name Konva.Node#cache
     * @param {Object} [config]
     * @param {Number} [config.x]
     * @param {Number} [config.y]
     * @param {Number} [config.width]
     * @param {Number} [config.height]
     * @param {Number} [config.offset]  increase canvas size by `offset` pixel in all directions.
     * @param {Boolean} [config.drawBorder] when set to true, a red border will be drawn around the cached
     *  region for debugging purposes
     * @param {Number} [config.pixelRatio] pixel ratio of the cache canvas, the canvas pixels per CSS pixel of the node. Default is `Konva.pixelRatio`, the device pixel ratio. A higher value keeps the cache sharp when the node is scaled up.
     * @param {Boolean} [config.imageSmoothingEnabled] control imageSmoothingEnabled property of created canvas for cache
     * @param {Number} [config.hitCanvasPixelRatio] change quality (or pixel ratio) of cached hit canvas.
     * @returns {Konva.Node}
     * @example
     * // cache a shape with the x,y position of the bounding box at the center and
     * // the width and height of the bounding box equal to the width and height of
     * // the shape obtained from shape.width() and shape.height()
     * image.cache();
     *
     * // cache a node and define the bounding box position and size
     * node.cache({
     *   x: -30,
     *   y: -30,
     *   width: 100,
     *   height: 200
     * });
     *
     * // cache a node and draw a red border around the bounding box
     * // for debugging purposes
     * node.cache({
     *   x: -30,
     *   y: -30,
     *   width: 100,
     *   height: 200,
     *   offset : 10,
     *   drawBorder: true
     * });
     */
    cache(config?: CanvasConfig & {
        drawBorder?: boolean;
        offset?: number;
        hitCanvasPixelRatio?: number;
    }): this;
    _getCachedHitCanvas(top?: Node): HitCanvas | null;
    /**
     * determine if node is currently cached
     * @method
     * @name Konva.Node#isCached
     * @returns {Boolean}
     */
    isCached(): boolean;
    abstract drawScene(canvas?: Canvas, top?: Node): void;
    abstract drawHit(canvas?: Canvas, top?: Node): void;
    /**
     * Return client rectangle {x, y, width, height} of node. This rectangle also include all styling (strokes, shadows, etc).
     * The purpose of the method is similar to getBoundingClientRect API of the DOM.
     * Non-scaling stroke padding is converted from its drawing canvas to the requested coordinates.
     * Cached strokes use the cache's coordinates; their pixels scale with the cached bitmap.
     * @method
     * @name Konva.Node#getClientRect
     * @param {Object} config
     * @param {Boolean} [config.skipTransform] should we apply transform to node for calculating rect?
     * @param {Boolean} [config.skipShadow] should we apply shadow to the node for calculating bound box?
     * @param {Boolean} [config.skipStroke] should we apply stroke to the node for calculating bound box?
     * @param {Object} [config.relativeTo] calculate client rect relative to one of the parents
     * @returns {Object} rect with {x, y, width, height} properties
     * @example
     * var rect = new Konva.Rect({
     *      width : 100,
     *      height : 100,
     *      x : 50,
     *      y : 50,
     *      strokeWidth : 4,
     *      stroke : 'black',
     *      offsetX : 50,
     *      scaleY : 2
     * });
     *
     * // get client rect without think off transformations (position, rotation, scale, offset, etc)
     * rect.getClientRect({ skipTransform: true});
     * // returns {
     * //     x : -2,   // two pixels for stroke / 2
     * //     y : -2,
     * //     width : 104, // increased by 4 for stroke
     * //     height : 104
     * //}
     *
     * // get client rect with transformation applied
     * rect.getClientRect();
     * // returns Object {x: -2, y: 46, width: 104, height: 208}
     */
    getClientRect(config?: GetClientRectConfig): IRect;
    _getCachedSceneRect(config: GetClientRectConfig): IRect | undefined;
    _transformedRect(rect: IRect, top?: Node | null): IRect;
    _drawCachedSceneCanvas(context: Context): void;
    _drawCachedHitCanvas(context: Context, hitCanvas: HitCanvas): void;
    _getCachedSceneCanvas(): Canvas;
    on<K extends keyof NodeEventMap>(evtStr: K, handler: KonvaEventListener<this, NodeEventMap[K]>): this;
    on<K extends keyof NodeEventMap>(evtStr: K, selector: string, handler: KonvaEventListener<Node, NodeEventMap[K]>): this;
    /**
     * remove event bindings from the node. Pass in a string of
     *  event types delimmited by a space to remove multiple event
     *  bindings at once such as 'mousedown mouseup mousemove'.
     *  include a namespace to remove an event binding by name
     *  such as 'click.foobar'. If you only give a name like '.foobar',
     *  all events in that namespace will be removed.
     * @method
     * @name Konva.Node#off
     * @param {String} evtStr e.g. 'click', 'mousedown touchstart', '.foobar'
     * @returns {Konva.Node}
     * @example
     * // remove listener
     * node.off('click');
     *
     * // remove multiple listeners
     * node.off('click touchstart');
     *
     * // remove listener by name
     * node.off('click.foo');
     */
    _prepareListeners(): void;
    off(evtStr?: string, callback?: Function): this;
    dispatchEvent(evt: any): this;
    addEventListener(type: string, handler: (e: Event) => void): this;
    removeEventListener(type: string): this;
    _delegate(event: string, selector: string, handler: (e: Event) => void): this;
    /**
     * remove a node from parent, but don't destroy. You can reuse the node later.
     * @method
     * @name Konva.Node#remove
     * @returns {Konva.Node}
     * @example
     * node.remove();
     */
    remove(): this;
    _clearCaches(): void;
    _remove(): void;
    /**
     * remove and destroy a node. Kill it and delete forever! You should not reuse node after destroy().
     * If the node is a container (Group, Stage or Layer) it will destroy all children too.
     * The node fires a `destroy` event first, so anything holding a reference to it can let go.
     * When an ancestor is being destroyed the node is already detached from its parent at that point.
     * @method
     * @name Konva.Node#destroy
     * @example
     * node.on('destroy', () => console.log('gone'));
     * node.destroy();
     */
    destroy(): this;
    /**
     * get attr
     * @method
     * @name Konva.Node#getAttr
     * @param {String} attr
     * @returns {Integer|String|Object|Array}
     * @example
     * var x = node.getAttr('x');
     */
    getAttr<AttrConfig extends Config, K extends AnyString<keyof Config>>(attr: K): K extends keyof AttrConfig ? AttrConfig[K] : any;
    /**
     * get ancestors
     * @method
     * @name Konva.Node#getAncestors
     * @returns {Array}
     * @example
     * shape.getAncestors().forEach(function(node) {
     *   console.log(node.id());
     * })
     */
    getAncestors(): Node<NodeConfig>[];
    /**
     * get attrs object literal
     * @method
     * @name Konva.Node#getAttrs
     * @returns {Object}
     */
    getAttrs(): Config;
    /**
     * set multiple attrs at once using an object literal
     * @method
     * @name Konva.Node#setAttrs
     * @param {Object} config object containing key value pairs
     * @returns {Konva.Node}
     * @example
     * node.setAttrs({
     *   x: 5,
     *   fill: 'red'
     * });
     */
    setAttrs(config?: Config): this;
    /**
     * determine if node is listening for events by taking into account ancestors.
     *
     * Parent    | Self      | isListening
     * listening | listening |
     * ----------+-----------+------------
     * T         | T         | T
     * T         | F         | F
     * F         | T         | F
     * F         | F         | F
     *
     * @method
     * @name Konva.Node#isListening
     * @returns {Boolean}
     */
    isListening(): any;
    _isListening(relativeTo?: Node): boolean;
    /**
     * determine if node is visible by taking into account ancestors.
     *
     * Parent    | Self      | isVisible
     * visible   | visible   |
     * ----------+-----------+------------
     * T         | T         | T
     * T         | F         | F
     * F         | T         | F
     * F         | F         | F
     * @method
     * @name Konva.Node#isVisible
     * @returns {Boolean}
     */
    isVisible(): any;
    _isVisible(relativeTo?: Node): boolean;
    shouldDrawHit(top?: Node): any;
    /**
     * show node. set visible = true
     * @method
     * @name Konva.Node#show
     * @returns {Konva.Node}
     */
    show(): this;
    /**
     * hide node.  Hidden nodes are no longer detectable
     * @method
     * @name Konva.Node#hide
     * @returns {Konva.Node}
     */
    hide(): this;
    getZIndex(): number;
    /**
     * get absolute z-index which takes into account sibling
     *  and ancestor indices
     * @method
     * @name Konva.Node#getAbsoluteZIndex
     * @returns {Integer}
     */
    getAbsoluteZIndex(): number;
    /**
     * get node depth in node tree.  Returns an integer.
     *  e.g. Stage depth will always be 0.  Layers will always be 1.  Groups and Shapes will always
     *  be >= 2
     * @method
     * @name Konva.Node#getDepth
     * @returns {Integer}
     * @example
     * var depth = shape.getDepth(); // 2 for a shape right inside of a layer
     */
    getDepth(): number;
    _batchTransformChanges(func: any): void;
    setPosition(pos: Vector2d): this;
    getPosition(): {
        x: number;
        y: number;
    };
    /**
     * get position of first pointer (like mouse or first touch) relative to local coordinates of current node
     * @method
     * @name Konva.Node#getRelativePointerPosition
     * @returns {Konva.Node}
     * @example
     *
     * // let's think we have a rectangle at position x = 10, y = 10
     * // now we clicked at x = 15, y = 15 of the stage
     * // if you want to know position of the click, related to the rectangle you can use
     * rect.getRelativePointerPosition();
     */
    getRelativePointerPosition(): {
        x: number;
        y: number;
    } | null;
    /**
     * get absolute position of a node. That function can be used to calculate absolute position, but relative to any ancestor
     * @method
     * @name Konva.Node#getAbsolutePosition
     * @param {Object} [top] optional ancestor node
     * @returns {Konva.Node}
     * @example
     *
     * // returns absolute position relative to top-left corner of canvas
     * node.getAbsolutePosition();
     *
     * // calculate absolute position of node, inside stage
     * // so stage transforms are ignored
     * node.getAbsolutePosition(stage)
     */
    getAbsolutePosition(top?: Node): {
        x: number;
        y: number;
    };
    setAbsolutePosition(pos: Vector2d): this;
    _setTransform(trans: any): void;
    _clearTransform(): {
        x: number;
        y: number;
        rotation: number;
        scaleX: number;
        scaleY: number;
        offsetX: number;
        offsetY: number;
        skewX: number;
        skewY: number;
    };
    /**
     * move node by an amount relative to its current position
     * @method
     * @name Konva.Node#move
     * @param {Object} change
     * @param {Number} change.x
     * @param {Number} change.y
     * @returns {Konva.Node}
     * @example
     * // move node in x direction by 1px and y direction by 2px
     * node.move({
     *   x: 1,
     *   y: 2
     * });
     */
    move(change: Vector2d): this;
    /**
     * rotate node by an amount in degrees relative to its current rotation
     * @method
     * @name Konva.Node#rotate
     * @param {Number} theta
     * @returns {Konva.Node}
     */
    rotate(theta: number): this;
    /**
     * move node to the top of its siblings
     * @method
     * @name Konva.Node#moveToTop
     * @returns {Boolean}
     */
    moveToTop(): boolean;
    /**
     * move node up
     * @method
     * @name Konva.Node#moveUp
     * @returns {Boolean} flag is moved or not
     */
    moveUp(): boolean;
    /**
     * move node down
     * @method
     * @name Konva.Node#moveDown
     * @returns {Boolean}
     */
    moveDown(): boolean;
    /**
     * move node to the bottom of its siblings
     * @method
     * @name Konva.Node#moveToBottom
     * @returns {Boolean}
     */
    moveToBottom(): boolean;
    setZIndex(zIndex: any): this;
    /**
     * get absolute opacity
     * @method
     * @name Konva.Node#getAbsoluteOpacity
     * @returns {Number}
     */
    getAbsoluteOpacity(): any;
    _getAbsoluteOpacity(): number;
    /**
     * move node to another container
     * @method
     * @name Konva.Node#moveTo
     * @param {Container} newContainer
     * @returns {Konva.Node}
     * @example
     * // move node from current layer into layer2
     * node.moveTo(layer2);
     */
    moveTo(newContainer: any): this;
    /**
     * convert Node into an object for serialization.  Returns an object.
     * @method
     * @name Konva.Node#toObject
     * @returns {Object}
     */
    toObject(): {
        attrs: Config & Record<string, any>;
        className: string;
        children?: Array<any>;
    };
    /**
     * convert Node into a JSON string.  Returns a JSON string.
     * @method
     * @name Konva.Node#toJSON
     * @returns {String}
     */
    toJSON(): string;
    /**
     * get parent container
     * @method
     * @name Konva.Node#getParent
     * @returns {Konva.Node}
     */
    getParent(): Container<Node<NodeConfig>, import("./Container.ts").ContainerConfig> | null;
    /**
     * get all ancestors (parent then parent of the parent, etc) of the node
     * @method
     * @name Konva.Node#findAncestors
     * @param {String} selector selector for search
     * @param {Boolean} [includeSelf] show we think that node is ancestro itself?
     * @param {Konva.Node} [stopNode] optional node where we need to stop searching (one of ancestors)
     * @returns {Array} [ancestors]
     * @example
     * // get one of the parent group
     * var parentGroups = node.findAncestors('Group');
     */
    findAncestors(selector: string | Function, includeSelf?: boolean, stopNode?: Node): Node<NodeConfig>[];
    isAncestorOf(node: Node): boolean;
    /**
     * get ancestor (parent or parent of the parent, etc) of the node that match passed selector
     * @method
     * @name Konva.Node#findAncestor
     * @param {String} selector selector for search
     * @param {Boolean} [includeSelf] show we think that node is ancestro itself?
     * @param {Konva.Node} [stopNode] optional node where we need to stop searching (one of ancestors)
     * @returns {Konva.Node} ancestor
     * @example
     * // get one of the parent group
     * var group = node.findAncestors('.mygroup');
     */
    findAncestor(selector: string | Function, includeSelf?: boolean, stopNode?: Container): Node<NodeConfig>;
    _isMatch(selector: string | Function): any;
    /**
     * get layer ancestor
     * @method
     * @name Konva.Node#getLayer
     * @returns {Konva.Layer}
     */
    getLayer(): Layer | null;
    /**
     * get stage ancestor
     * @method
     * @name Konva.Node#getStage
     * @returns {Konva.Stage}
     */
    getStage(): Stage | null;
    _getStage(): Stage | null;
    /**
     * fire event
     * @method
     * @name Konva.Node#fire
     * @param {String} eventType event type.  can be a regular event, like click, mouseover, or mouseout, or it can be a custom event, like myCustomEvent
     * @param {Event} [evt] event object
     * @param {Boolean} [bubble] setting the value to false, or leaving it undefined, will result in the event
     *  not bubbling.  Setting the value to true will result in the event bubbling.
     * @returns {Konva.Node}
     * @example
     * // manually fire click event
     * node.fire('click');
     *
     * // fire custom event
     * node.fire('foo');
     *
     * // fire custom event with custom event object
     * node.fire('foo', {
     *   bar: 10
     * });
     *
     * // fire click event that bubbles
     * node.fire('click', null, true);
     */
    fire(eventType: string, evt?: any, bubble?: boolean): this;
    /**
     * get absolute transform of the node which takes into
     *  account its ancestor transforms
     * @method
     * @name Konva.Node#getAbsoluteTransform
     * @returns {Konva.Transform}
     */
    getAbsoluteTransform(top?: Node | null): Transform;
    _hasCachedAncestor(): boolean;
    _getAbsoluteTransform(top?: Node | null): Transform;
    _getCachedAbsoluteTransform(): Transform;
    _multiplyOwnTransform(at: Transform): Transform;
    /**
     * get absolute scale of the node which takes into
     *  account its ancestor scales
     * @method
     * @name Konva.Node#getAbsoluteScale
     * @returns {Object}
     * @example
     * // get absolute scale x
     * var scaleX = node.getAbsoluteScale().x;
     */
    getAbsoluteScale(top?: Node): {
        x: number;
        y: number;
    };
    /**
     * get absolute rotation of the node which takes into
     *  account its ancestor rotations
     * @method
     * @name Konva.Node#getAbsoluteRotation
     * @returns {Number}
     * @example
     * // get absolute rotation
     * var rotation = node.getAbsoluteRotation();
     */
    getAbsoluteRotation(): number;
    /**
     * get transform of the node
     * @method
     * @name Konva.Node#getTransform
     * @returns {Konva.Transform}
     */
    getTransform(): Transform;
    _getTransform(): Transform;
    /**
     * clone node.  Returns a new Node instance with identical attributes.  You can also override
     *  the node properties with an object literal, enabling you to use an existing node as a template
     *  for another node
     * @method
     * @name Konva.Node#clone
     * @param {Object} obj override attrs
     * @returns {Konva.Node}
     * @example
     * // simple clone
     * var clone = node.clone();
     *
     * // clone a node and override the x position
     * var clone = rect.clone({
     *   x: 5
     * });
     */
    clone(obj?: any): any;
    _toKonvaCanvas(config: any): SceneCanvas;
    /**
     * converts node into an canvas element.
     * @method
     * @name Konva.Node#toCanvas
     * @param {Object} config
     * @param {Function} config.callback function executed when the composite has completed
     * @param {Number} [config.x] x position of canvas section
     * @param {Number} [config.y] y position of canvas section
     * @param {Number} [config.width] width of canvas section
     * @param {Number} [config.height] height of canvas section
     * @param {Number} [config.pixelRatio] pixelRatio of output canvas. Default is 1.
     * Higher pixel ratios increase export resolution. Cached nodes keep their cache resolution.
     * Rebuild caches at the export pixel ratio to preserve detail.
     * The pixel ratio multiplies the dimensions of the exported image.
     * If you export to 500x500 size with pixelRatio = 2, then produced image will have size 1000x1000.
     * @param {Boolean} [config.imageSmoothingEnabled] set this to false if you want to disable imageSmoothing
     * @example
     * var canvas = node.toCanvas();
     */
    toCanvas(config?: CanvasConfig): HTMLCanvasElement;
    /**
     * Creates a composite data URL (base64 string). If MIME type is not
     * specified, then "image/png" will result. For "image/jpeg", specify a quality
     * level as quality (range 0.0 - 1.0)
     * @method
     * @name Konva.Node#toDataURL
     * @param {Object} config
     * @param {String} [config.mimeType] can be "image/png" or "image/jpeg".
     *  "image/png" is the default
     * @param {Number} [config.x] x position of canvas section
     * @param {Number} [config.y] y position of canvas section
     * @param {Number} [config.width] width of canvas section
     * @param {Number} [config.height] height of canvas section
     * @param {Number} [config.quality] jpeg quality.  If using an "image/jpeg" mimeType,
     *  you can specify the quality from 0 to 1, where 0 is very poor quality and 1
     *  is very high quality
     * @param {Number} [config.pixelRatio] pixelRatio of output image url. Default is 1.
     * Higher pixel ratios increase export resolution. Cached nodes keep their cache resolution.
     * Rebuild caches at the export pixel ratio to preserve detail.
     * The pixel ratio multiplies the dimensions of the exported image.
     * If you export to 500x500 size with pixelRatio = 2, then produced image will have size 1000x1000.
     * @param {Boolean} [config.imageSmoothingEnabled] set this to false if you want to disable imageSmoothing
     * @returns {String}
     */
    toDataURL(config?: ImageConfig & {
        callback?: (url: string) => void;
    }): string;
    /**
     * converts node into an image.  Since the toImage
     *  method is asynchronous, the resulting image can only be retrieved from the config callback
     *  or the returned Promise.  toImage is most commonly used
     *  to cache complex drawings as an image so that they don't have to constantly be redrawn
     * @method
     * @name Konva.Node#toImage
     * @param {Object} config
     * @param {Function} [config.callback] function executed when the composite has completed
     * @param {String} [config.mimeType] can be "image/png" or "image/jpeg".
     *  "image/png" is the default
     * @param {Number} [config.x] x position of canvas section
     * @param {Number} [config.y] y position of canvas section
     * @param {Number} [config.width] width of canvas section
     * @param {Number} [config.height] height of canvas section
     * @param {Number} [config.quality] jpeg quality.  If using an "image/jpeg" mimeType,
     *  you can specify the quality from 0 to 1, where 0 is very poor quality and 1
     *  is very high quality
     * @param {Number} [config.pixelRatio] pixelRatio of output image. Default is 1.
     * Higher pixel ratios increase export resolution. Cached nodes keep their cache resolution.
     * Rebuild caches at the export pixel ratio to preserve detail.
     * The pixel ratio multiplies the dimensions of the exported image.
     * If you export to 500x500 size with pixelRatio = 2, then produced image will have size 1000x1000.
     * @param {Boolean} [config.imageSmoothingEnabled] set this to false if you want to disable imageSmoothing
     * @return {Promise<Image>}
     * @example
     * var image = node.toImage({
     *   callback(img) {
     *     // do stuff with img
     *   }
     * });
     */
    toImage(config?: ImageConfig & {
        callback?: (img: HTMLImageElement) => void;
    }): Promise<HTMLImageElement>;
    /**
     * Converts node into a blob.  Since the toBlob method is asynchronous,
     *  the resulting blob can only be retrieved from the config callback
     *  or the returned Promise.
     * @method
     * @name Konva.Node#toBlob
     * @param {Object} config
     * @param {Function} [config.callback] function executed when the composite has completed
     * @param {Number} [config.x] x position of canvas section
     * @param {Number} [config.y] y position of canvas section
     * @param {Number} [config.width] width of canvas section
     * @param {Number} [config.height] height of canvas section
     * @param {Number} [config.pixelRatio] pixelRatio of output canvas. Default is 1.
     * Higher pixel ratios increase export resolution. Cached nodes keep their cache resolution.
     * Rebuild caches at the export pixel ratio to preserve detail.
     * The pixel ratio multiplies the dimensions of the exported image.
     * If you export to 500x500 size with pixelRatio = 2, then produced image will have size 1000x1000.
     * @param {Boolean} [config.imageSmoothingEnabled] set this to false if you want to disable imageSmoothing
     * @example
     * var blob = await node.toBlob({});
     * @returns {Promise<Blob>} rejects if the canvas can not be encoded
     */
    toBlob(config?: ImageConfig & {
        callback?: (blob: Blob) => void;
    }): Promise<Blob>;
    setSize(size: any): this;
    getSize(): {
        width: number;
        height: number;
    };
    /**
     * get class name, which may return Stage, Layer, Group, or shape class names like Rect, Circle, Text, etc.
     * @method
     * @name Konva.Node#getClassName
     * @returns {String}
     */
    getClassName(): string;
    /**
     * get the node type, which may return Stage, Layer, Group, or Shape
     * @method
     * @name Konva.Node#getType
     * @returns {String}
     */
    getType(): string;
    getDragDistance(): number;
    _off(type: any, name?: any, callback?: any): void;
    _fireChangeEvent(attr: any, oldVal: any, newVal: any): void;
    /**
     * add name to node
     * @method
     * @name Konva.Node#addName
     * @param {String} name
     * @returns {Konva.Node}
     * @example
     * node.name('red');
     * node.addName('selected');
     * node.name(); // return 'red selected'
     */
    addName(name: string): this;
    /**
     * check is node has name
     * @method
     * @name Konva.Node#hasName
     * @param {String} name
     * @returns {Boolean}
     * @example
     * node.name('red');
     * node.hasName('red');   // return true
     * node.hasName('selected'); // return false
     * node.hasName(''); // return false
     */
    hasName(name: any): boolean;
    /**
     * remove name from node
     * @method
     * @name Konva.Node#removeName
     * @param {String} name
     * @returns {Konva.Node}
     * @example
     * node.name('red selected');
     * node.removeName('selected');
     * node.hasName('selected'); // return false
     * node.name(); // return 'red'
     */
    removeName(name: any): this;
    /**
     * set attr
     * @method
     * @name Konva.Node#setAttr
     * @param {String} attr
     * @param {*} val
     * @returns {Konva.Node}
     * @example
     * node.setAttr('x', 5);
     */
    setAttr<AttrConfig extends Config, K extends AnyString<keyof Config>>(attr: K, val: K extends keyof AttrConfig ? AttrConfig[K] : any): this;
    _addSubtreeObserver(observer: SubtreeObserver): void;
    _removeSubtreeObserver(observer: SubtreeObserver): void;
    _notifySubtreeChange(): void;
    _requestDraw(): void;
    _setAttr<AttrConfig extends Config, K extends AnyString<keyof Config>>(key: K, val: K extends keyof AttrConfig ? AttrConfig[K] : any): void;
    _fireAndBubble(eventType: any, evt: any, compareShape?: any): void;
    static protoListenerMap: WeakMap<object, any>;
    _getProtoListeners(eventType: any): any;
    _fire(eventType: any, evt: any): void;
    /**
     * draw both scene and hit graphs.  If the node being drawn is the stage, all of the layers will be cleared and redrawn
     * @method
     * @name Konva.Node#draw
     * @returns {Konva.Node}
     */
    draw(): this;
    _createDragElement(evt: any): void;
    /**
     * initiate drag and drop.
     * @method
     * @name Konva.Node#startDrag
     */
    startDrag(evt?: any, bubbleEvent?: boolean): void;
    _setDragPosition(evt: any, elem: any): void;
    /**
     * stop drag and drop
     * @method
     * @name Konva.Node#stopDrag
     */
    stopDrag(evt?: any): void;
    setDraggable(draggable: any): void;
    /**
     * determine if node is currently in drag and drop mode
     * @method
     * @name Konva.Node#isDragging
     */
    isDragging(): boolean;
    _listenDrag(): void;
    _dragChange(): void;
    _dragCleanup(): void;
    /**
     * determine if node (at least partially) is currently in user-visible area
     * @method
     * @param {(Number | Object)} margin optional margin in pixels
     * @param {Number} margin.x
     * @param {Number} margin.y
     * @returns {Boolean}
     * @name Konva.Node#isClientRectOnScreen
     * @example
     * // get index
     * // default calculations
     * var isOnScreen = node.isClientRectOnScreen()
     * // increase object size (or screen size) for cases when objects close to the screen still need to be marked as "visible"
     * var isOnScreen = node.isClientRectOnScreen({ x: stage.width(), y: stage.height() })
     */
    isClientRectOnScreen(margin?: {
        x: number;
        y: number;
    }): boolean;
    preventDefault: GetSet<boolean, this>;
    blue: GetSet<number, this>;
    brightness: GetSet<number, this>;
    contrast: GetSet<number, this>;
    blurRadius: GetSet<number, this>;
    luminance: GetSet<number, this>;
    green: GetSet<number, this>;
    alpha: GetSet<number, this>;
    hue: GetSet<number, this>;
    kaleidoscopeAngle: GetSet<number, this>;
    kaleidoscopePower: GetSet<number, this>;
    levels: GetSet<number, this>;
    noise: GetSet<number, this>;
    pixelSize: GetSet<number, this>;
    red: GetSet<number, this>;
    saturation: GetSet<number, this>;
    threshold: GetSet<number, this>;
    value: GetSet<number, this>;
    dragBoundFunc: GetSet<(this: Node, pos: Vector2d, event: any) => Vector2d, this>;
    draggable: GetSet<boolean, this>;
    dragDistance: GetSet<number, this>;
    embossBlend: GetSet<boolean, this>;
    embossDirection: GetSet<string, this>;
    embossStrength: GetSet<number, this>;
    embossWhiteLevel: GetSet<number, this>;
    enhance: GetSet<number, this>;
    filters: GetSet<Filters, this>;
    position: GetSet<Vector2d, this, Vector2d>;
    absolutePosition: GetSet<Vector2d, this, Vector2d>;
    size: GetSet<{
        width: number;
        height: number;
    }, this, {
        width: number;
        height: number;
    }>;
    id: GetSet<string, this>;
    listening: GetSet<boolean, this>;
    name: GetSet<string, this>;
    offset: GetSet<Vector2d, this>;
    offsetX: GetSet<number, this>;
    offsetY: GetSet<number, this>;
    opacity: GetSet<number, this>;
    rotation: GetSet<number, this>;
    zIndex: GetSet<number, this>;
    scale: GetSet<Vector2d, this>;
    scaleX: GetSet<number, this>;
    scaleY: GetSet<number, this>;
    skew: GetSet<Vector2d, this>;
    skewX: GetSet<number, this>;
    skewY: GetSet<number, this>;
    to: (params: Omit<TweenConfig, 'node'>) => Tween;
    transformsEnabled: GetSet<string, this>;
    visible: GetSet<boolean, this>;
    width: GetSet<number, this>;
    height: GetSet<number, this>;
    x: GetSet<number, this>;
    y: GetSet<number, this>;
    globalCompositeOperation: GetSet<globalCompositeOperationType, this>;
    /**
     * create node with JSON string or an Object. Deserialization restores attributes only,
     *  not functions, images or event handlers (that would make the serialized object huge):
     *  `sceneFunc`/`hitFunc` of custom shapes, images and `fillPatternImage`, `clipFunc`,
     *  `dragBoundFunc`, filter functions, the `nodes`, `boundBoxFunc` and `anchorStyleFunc`
     *  of a Transformer, typed arrays and the `cache()` state. If your app uses them (it probably
     *  does), select the nodes after loading the stage and set these properties again with
     *  `on()`, `sceneFunc()`, `image()` and so on
     * @method
     * @memberof Konva.Node
     * @param {String|Object} data string or object
     * @param {Element} [container] optional container dom element used only if you're
     *  creating a stage node
     */
    static create(data: any, container?: any): any;
    static _createNode(obj: any, container?: any): any;
}
export {};
