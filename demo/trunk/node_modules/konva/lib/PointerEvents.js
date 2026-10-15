import { Konva } from "./Global.js";
const Captures = new Map();
// we may use this module for capturing touch events too
// so make sure we don't do something super specific to pointer
const SUPPORT_POINTER_EVENTS = Konva._global['PointerEvent'] !== undefined;
export function getCapturedShape(pointerId, stage) {
    const capture = Captures.get(pointerId);
    return capture && (!stage || capture.stage === stage)
        ? capture.shape
        : undefined;
}
function fireCapture(shape, type, pointerId) {
    shape._fire(type, { evt: new PointerEvent(type, { pointerId }), pointerId });
}
export function hasPointerCapture(pointerId, shape) {
    var _a;
    return ((_a = Captures.get(pointerId)) === null || _a === void 0 ? void 0 : _a.shape) === shape;
}
export function setPointerCapture(pointerId, shape) {
    var _a;
    releaseCapture(pointerId);
    const stage = shape.getStage();
    if (!stage)
        return;
    // Native capture belongs to this stage even if the shape is reparented.
    Captures.set(pointerId, { shape, stage });
    if (SUPPORT_POINTER_EVENTS) {
        // capture on the DOM level too, so the stage keeps receiving the events
        // of that pointer even when it moves outside of the stage container
        // https://github.com/konvajs/konva/issues/1992
        try {
            (_a = stage.content) === null || _a === void 0 ? void 0 : _a.setPointerCapture(pointerId);
        }
        catch (e) {
            // capture is possible only for an active pointer;
            // ids of mouse and touch events (999 and touch identifiers) and
            // programmatic calls outside of a pointer event land here
        }
        fireCapture(shape, 'gotpointercapture', pointerId);
    }
}
// Destroying either the captured node or its native stage ends capture.
export function releaseCapturesOf(node) {
    Captures.forEach(({ shape, stage }, pointerId) => {
        if (shape === node || stage === node) {
            releaseCapture(pointerId);
        }
    });
}
export function releaseCapture(pointerId, target) {
    var _a;
    const capture = Captures.get(pointerId);
    // a node can only release its own capture
    if (!capture || (target && capture.shape !== target))
        return;
    const { shape, stage } = capture;
    Captures.delete(pointerId);
    if (SUPPORT_POINTER_EVENTS) {
        try {
            (_a = stage.content) === null || _a === void 0 ? void 0 : _a.releasePointerCapture(pointerId);
        }
        catch (e) {
            // same as in setPointerCapture: the pointer may not be active
        }
        fireCapture(shape, 'lostpointercapture', pointerId);
    }
}
