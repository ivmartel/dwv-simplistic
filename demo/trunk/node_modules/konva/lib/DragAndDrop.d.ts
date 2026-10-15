import type { Node } from './Node.ts';
import type { Stage } from './Stage.ts';
import type { Vector2d } from './types.ts';
type DragElement = {
    node: Node;
    startPointerPos: Vector2d;
    offset: Vector2d;
    pointerId?: number;
    pointerEventType?: Stage['_pointerEventType'];
    lastPos?: Vector2d;
    startEvent?: any;
    dragStatus: 'ready' | 'dragging' | 'stopped';
};
export declare const DD: {
    readonly isDragging: boolean;
    readonly node: Node<import("./Node.ts").NodeConfig> | undefined;
    _dragElements: Map<number, DragElement>;
    _listenToWindow(win: Window): void;
    _batchEvents(callback: () => void, win?: Window): void;
    _drag(evt: any, win?: Window): void;
    _endDragBefore(evt?: any, win?: Window, only?: DragElement): void;
    _endDragAfter(evt: any, only?: DragElement): void;
};
export {};
