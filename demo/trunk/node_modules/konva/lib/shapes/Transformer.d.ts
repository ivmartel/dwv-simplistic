import { Transform } from '../Util.ts';
import { Node } from '../Node.ts';
import { Shape } from '../Shape.ts';
import { Rect } from './Rect.ts';
import { Group } from '../Group.ts';
import { type ContainerConfig } from '../Container.ts';
import type { GetSet, IRect, Vector2d } from '../types.ts';
import type { HitCanvas, SceneCanvas } from '../Canvas.ts';
export interface Box extends IRect {
    rotation: number;
}
export interface TransformerConfig extends ContainerConfig {
    nodes?: Array<Node>;
    resizeEnabled?: boolean;
    rotateEnabled?: boolean;
    rotateLineVisible?: boolean;
    rotationSnaps?: Array<number>;
    rotationSnapTolerance?: number;
    rotateAnchorOffset?: number;
    rotateAnchorAngle?: number;
    rotateAnchorCursor?: string;
    rotateMode?: 'handle' | 'corners' | 'both';
    borderEnabled?: boolean;
    borderStroke?: string;
    borderStrokeWidth?: number;
    borderDash?: Array<number>;
    anchorFill?: string;
    anchorStroke?: string;
    anchorStrokeWidth?: number;
    anchorSize?: number;
    anchorCornerRadius?: number;
    keepRatio?: boolean;
    shiftBehavior?: string;
    centeredScaling?: boolean;
    enabledAnchors?: Array<string>;
    flipEnabled?: boolean;
    ignoreStroke?: boolean;
    boundBoxFunc?: (oldBox: Box, newBox: Box) => Box;
    useSingleNodeRotation?: boolean;
    shouldOverdrawWholeArea?: boolean;
    anchorDragBoundFunc?: (oldPos: Vector2d, newPos: Vector2d, evt: any) => Vector2d;
    anchorStyleFunc?: (anchor: Rect) => void;
}
/**
 * Transformer constructor.  Transformer is a special type of group that allow you transform Konva
 * primitives and shapes. Transforming tool is not changing `width` and `height` properties of nodes
 * when you resize them. Instead it changes `scaleX` and `scaleY` properties.
 * @constructor
 * @memberof Konva
 * @param {Object} config
 * @param {Boolean} [config.resizeEnabled] Default is true
 * @param {Boolean} [config.rotateEnabled] Default is true
 * @param {Boolean} [config.rotateLineVisible] Default is true
 * @param {Array} [config.rotationSnaps] Array of angles for rotation snaps. Default is []
 * @param {Number} [config.rotationSnapTolerance] Snapping tolerance. If closer than this it will snap. Default is 5
 * @param {Number} [config.rotateAnchorOffset] Default is 50
 * @param {Number} [config.rotateAnchorAngle] Angle of the rotate anchor around the box, in degrees. Default is 0 (top)
 * @param {String} [config.rotateAnchorCursor] Default is crosshair
 * @param {String} [config.rotateMode] How the user rotates: 'handle' (the rotate anchor), 'corners' (invisible zones just outside the corners) or 'both'. Default is 'handle'
 * @param {Number} [config.padding] Default is 0
 * @param {Boolean} [config.borderEnabled] Should we draw border? Default is true
 * @param {String} [config.borderStroke] Border stroke color
 * @param {Number} [config.borderStrokeWidth] Border stroke size
 * @param {Array} [config.borderDash] Array for border dash.
 * @param {String} [config.anchorFill] Anchor fill color
 * @param {String} [config.anchorStroke] Anchor stroke color
 * @param {Number} [config.anchorCornerRadius] Anchor corner radius
 * @param {Number} [config.anchorStrokeWidth] Anchor stroke size
 * @param {Number} [config.anchorSize] Default is 10
 * @param {Boolean} [config.keepRatio] Should we keep ratio when we are moving edges? Default is true
 * @param {String} [config.shiftBehavior] How does transformer react on shift key press when we are moving edges? 'none' also turns off the Shift rotation snap. Default is 'default'
 * @param {Boolean} [config.centeredScaling] Should we resize relative to node's center? Default is false
 * @param {Array} [config.enabledAnchors] Array of names of enabled handles
 * @param {Boolean} [config.flipEnabled] Can we flip/mirror shape on transform?. True by default
 * @param {Function} [config.boundBoxFunc] Bounding box function, see {@link Konva.Transformer#boundBoxFunc}
 * @param {Function} [config.anchorDragBoundFunc] Function bounding the position of a dragged anchor, see {@link Konva.Transformer#anchorDragBoundFunc}
 * @param {Function} [config.anchorStyleFunc] Function styling every anchor, see {@link Konva.Transformer#anchorStyleFunc}
 * @param {Boolean} [config.ignoreStroke] Should we ignore stroke size? Default is false
 * @param {Boolean} [config.useSingleNodeRotation] When just one node attached, should we use its rotation for transformer?
 * @param {Boolean} [config.shouldOverdrawWholeArea] Should we fill whole transformer area with fake transparent shape to enable dragging from empty spaces?
 * @example
 * var transformer = new Konva.Transformer({
 *   nodes: [rectangle],
 *   rotateAnchorOffset: 60,
 *   enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
 * });
 * layer.add(transformer);
 */
export declare class Transformer extends Group {
    _nodes: Array<Node>;
    _nodeRectCache?: Map<Node, {
        rotation: number;
        ignoreStroke: boolean;
        version: number;
        width: number;
        height: number;
        minX: number;
        minY: number;
        maxX: number;
        maxY: number;
    }>;
    _movingAnchorName: string | null;
    _pointerId?: number;
    _anchors: Record<string, Rect>;
    _back: Shape;
    _transforming: boolean;
    _fitting: boolean;
    _transformWindow: Window | null;
    _anchorDragOffset: Vector2d;
    _rotateStart?: {
        pointerAngle: number;
        rotation: number;
    };
    sin: number;
    cos: number;
    _cursorChange: boolean;
    _elementsCreated: boolean;
    _lastNodeRect?: Readonly<Box>;
    _updatePending: boolean;
    static isTransforming: () => boolean;
    static _isLayerTransforming(layer: Node): boolean;
    constructor(config?: TransformerConfig);
    /**
     * alias to `tr.nodes([shape])`/ This method is deprecated and will be removed soon.
     * @method
     * @name Konva.Transformer#attachTo
     * @returns {Konva.Transformer}
     * @example
     * transformer.attachTo(shape);
     */
    attachTo(node: Node): this;
    setNode(node: Node): this;
    getNode(): Node<import("../Node.ts").NodeConfig>;
    _getEventNamespace(): string;
    setNodes(nodes?: Array<Node>): this;
    _proxyDrag(node: Node): void;
    _detachNode(node: Node): void;
    _resetRotation(): void;
    _removeNode(node: Node): void;
    getNodes(): Node<import("../Node.ts").NodeConfig>[];
    /**
     * return the name of current active anchor
     * @method
     * @name Konva.Transformer#getActiveAnchor
     * @returns {String | Null}
     * @example
     * transformer.getActiveAnchor();
     */
    getActiveAnchor(): string | null;
    /**
     * detach transformer from an attached node
     * @method
     * @name Konva.Transformer#detach
     * @returns {Konva.Transformer}
     * @example
     * transformer.detach();
     */
    detach(): void;
    /**
     * bind events to the Transformer. You can use events: `transform`, `transformstart`, `transformend`, `dragstart`, `dragmove`, `dragend`
     * @method
     * @name Konva.Transformer#on
     * @param {String} evtStr e.g. 'transform'
     * @param {Function} handler The handler function. The first argument of that function is event object. Event object has `target` as main target of the event, `currentTarget` as current node listener and `evt` as native browser event.
     * @returns {Konva.Transformer}
     * @example
     * // add click listener
     * tr.on('transformstart', function() {
     *   console.log('transform started');
     * });
     */
    _resetTransformCache(changedNode?: Node): void;
    _onSubtreeChange(node: Node): void;
    _syncUpdate(): void;
    drawScene(can?: SceneCanvas, top?: Node): this;
    drawHit(can?: HitCanvas, top?: Node): this;
    _getNodeRect(): any;
    __getNodeRect(): {
        x: number;
        y: number;
        width: number;
        height: number;
        rotation: number;
    };
    getX(): any;
    getY(): any;
    getWidth(): any;
    getHeight(): any;
    _createElements(): void;
    _createAnchor(name: string, className?: string): Rect;
    _setAnchorCursor(name: string, rad?: number): void;
    _createBack(): void;
    _handleMouseDown(e: any): void;
    _handleMouseMove(e: any): void;
    _moveTransform(e: any): void;
    _handleMouseUp(e: any): void;
    getAbsoluteTransform(top?: Node | null): Transform;
    _removeEvents(e?: any): void;
    _fitNodesInto(newAttrs: any, evt?: any, anchorProjected?: boolean): void;
    _doFitNodesInto(newAttrs: any, evt?: any, anchorProjected?: boolean): void;
    _scheduleUpdate(): void;
    /**
     * force update of Konva.Transformer.
     * The transformer follows attribute changes of attached nodes and, for an attached group, any change of its descendants.
     * Use it after a change that sets no attribute, for example a `Line` points array mutated in place
     * or a custom `getSelfRect()` that depends on outside state.
     * @method
     * @name Konva.Transformer#forceUpdate
     */
    forceUpdate(): void;
    update(): void;
    _update(): void;
    _updateElements(attrs: Box): void;
    /**
     * determine if transformer is in active transform
     * @method
     * @name Konva.Transformer#isTransforming
     * @returns {Boolean}
     */
    isTransforming(): boolean;
    /**
     * Stop active transform action
     * @method
     * @name Konva.Transformer#stopTransform
     * @returns {Boolean}
     */
    stopTransform(): void;
    destroy(): this;
    add(...children: any[]): this;
    toObject(): {
        attrs: any;
        className: string;
        children?: Array<any>;
    };
    clone(obj?: any): this;
    getClientRect(config?: Parameters<Group['getClientRect']>[0]): IRect;
    nodes: GetSet<Node[], this>;
    enabledAnchors: GetSet<string[], this>;
    rotationSnaps: GetSet<number[], this>;
    anchorSize: GetSet<number, this>;
    resizeEnabled: GetSet<boolean, this>;
    rotateEnabled: GetSet<boolean, this>;
    rotateLineVisible: GetSet<boolean, this>;
    rotateAnchorOffset: GetSet<number, this>;
    rotateAnchorAngle: GetSet<number, this>;
    rotationSnapTolerance: GetSet<number, this>;
    rotateAnchorCursor: GetSet<string, this>;
    rotateMode: GetSet<'handle' | 'corners' | 'both', this>;
    padding: GetSet<number, this>;
    borderEnabled: GetSet<boolean, this>;
    borderStroke: GetSet<string, this>;
    borderStrokeWidth: GetSet<number, this>;
    borderDash: GetSet<number[], this>;
    anchorFill: GetSet<string, this>;
    anchorStroke: GetSet<string, this>;
    anchorCornerRadius: GetSet<number, this>;
    anchorStrokeWidth: GetSet<number, this>;
    keepRatio: GetSet<boolean, this>;
    shiftBehavior: GetSet<string, this>;
    centeredScaling: GetSet<boolean, this>;
    flipEnabled: GetSet<boolean, this>;
    ignoreStroke: GetSet<boolean, this>;
    boundBoxFunc: GetSet<(oldBox: Box, newBox: Box) => Box, this>;
    anchorDragBoundFunc: GetSet<(oldPos: Vector2d, newPos: Vector2d, evt: any) => Vector2d, this>;
    anchorStyleFunc: GetSet<null | ((Node: Rect) => void), this>;
    shouldOverdrawWholeArea: GetSet<boolean, this>;
    useSingleNodeRotation: GetSet<boolean, this>;
}
