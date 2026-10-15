export declare const glob: any;
export declare const Konva: {
    _global: any;
    version: string;
    isBrowser: boolean;
    isUnminified: boolean;
    dblClickWindow: number;
    getAngle(angle: number): number;
    enableTrace: boolean;
    pointerEventsEnabled: boolean;
    /**
     * Should Konva automatically update canvas on any changes. Default is true.
     * @property autoDrawEnabled
     * @default true
     * @name autoDrawEnabled
     * @memberof Konva
     * @example
     * Konva.autoDrawEnabled = true;
     */
    autoDrawEnabled: boolean;
    /**
     * Should we enable hit detection while dragging? For performance reasons, by default it is false.
     * But on some rare cases you want to see hit graph and check intersections. Just set it to true.
     * @property hitOnDragEnabled
     * @default false
     * @name hitOnDragEnabled
     * @memberof Konva
     * @example
     * Konva.hitOnDragEnabled = true;
     */
    hitOnDragEnabled: boolean;
    /**
     * Should we capture touch events and bind them to the touchstart target? That is how it works on DOM elements.
     * The case: we touchstart on div1, then touchmove out of that element into another element div2.
     * DOM will continue trigger touchmove events on div1 (not div2). Because events are "captured" into initial target.
     * By default Konva do not do that and will trigger touchmove on another element, while pointer is moving.
     * @property capturePointerEventsEnabled
     * @default false
     * @name capturePointerEventsEnabled
     * @memberof Konva
     * @example
     * Konva.capturePointerEventsEnabled = true;
     */
    capturePointerEventsEnabled: boolean;
    _renderBackend: string;
    /**
     * Use legacy text rendering. with "middle" baseline by default.
     * @property legacyTextRendering
     * @default false
     * @name legacyTextRendering
     * @memberof Konva
     * @example
     * Konva.legacyTextRendering = true;
     */
    legacyTextRendering: boolean;
    /**
     * Global pixel ratio configuration. KonvaJS automatically detect pixel ratio of current device.
     * But you may override such property, if you want to use your value. Set this value before any components initializations.
     * @property pixelRatio
     * @default window.devicePixelRatio || 1
     * @name pixelRatio
     * @memberof Konva
     * @example
     * // before any Konva code:
     * Konva.pixelRatio = 1;
     */
    pixelRatio: number;
    /**
     * Drag distance property. If you start to drag a node you may want to wait until pointer is moved to some distance from start point
     * on either axis, only then start dragging. Default is 3px.
     * @property dragDistance
     * @default 3
     * @memberof Konva
     * @example
     * Konva.dragDistance = 10;
     */
    dragDistance: number;
    /**
     * Use degree values for angle properties. You may set this property to false if you want to use radian values.
     * @property angleDeg
     * @default true
     * @memberof Konva
     * @example
     * node.rotation(45); // 45 degrees
     * Konva.angleDeg = false;
     * node.rotation(Math.PI / 2); // PI/2 radian
     */
    angleDeg: boolean;
    /**
     * Show warnings about wrong API usage (`Konva.Util.warn`). Errors are always printed
     * @property showWarnings
     * @default true
     * @memberof Konva
     * @example
     * Konva.showWarnings = false;
     */
    showWarnings: boolean;
    /**
     * Configure what mouse buttons can be used for drag and drop.
     * Default value is [0, 1] - left and middle mouse buttons.
     * @property dragButtons
     * @default [0, 1]
     * @memberof Konva
     * @example
     * // enable left and right mouse buttons
     * Konva.dragButtons = [0, 2];
     */
    dragButtons: number[];
    /**
     * returns whether or not drag and drop is currently active
     * @method
     * @memberof Konva
     */
    isDragging(): boolean;
    /**
     * returns whether or not a Transformer is currently transforming a node
     * @method
     * @memberof Konva
     */
    isTransforming(): boolean;
    /**
     * returns whether or not a drag and drop operation is ready, but may
     *  not necessarily have started
     * @method
     * @memberof Konva
     */
    isDragReady(): boolean;
    /**
     * Should Konva release canvas elements on destroy. Default is true.
     * Useful to avoid memory leak issues in Safari on macOS/iOS.
     * @property releaseCanvasOnDestroy
     * @default true
     * @name releaseCanvasOnDestroy
     * @memberof Konva
     * @example
     * Konva.releaseCanvasOnDestroy = true;
     */
    releaseCanvasOnDestroy: boolean;
    document: any;
    _injectGlobal(Konva: any): void;
};
export declare const _boundedShapes: Set<unknown>;
export declare const _registerNode: (NodeClass: any, boundsCoverPaint?: boolean) => void;
