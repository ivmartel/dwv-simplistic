// what is core parts of Konva?
import { Konva as Global } from "./Global.js";
import { Util, Transform } from "./Util.js";
import { Node } from "./Node.js";
import { Container } from "./Container.js";
import { Stage, stages } from "./Stage.js";
import { Layer } from "./Layer.js";
import { FastLayer } from "./FastLayer.js";
import { Group } from "./Group.js";
import { DD } from "./DragAndDrop.js";
import { Shape, shapes } from "./Shape.js";
import { Animation } from "./Animation.js";
import { Tween, Easings } from "./Tween.js";
import { Context } from "./Context.js";
import { Canvas } from "./Canvas.js";
export const Konva = Util._assign(Global, {
    /**
     * Defer automatic Konva.Transformer updates across many synchronous node changes
     * and run them once when the returned function is called.
     * A Transformer normally updates after every change of an attached node, so a loop
     * over N selected nodes costs N updates, each measuring all N nodes. In a batch it costs one.
     * A single setAttrs(), position(), destroyChildren(), removeChildren() call or animation frame is
     * already batched; use this for anything else, for example a React commit or an undo.
     * Attributes and change events stay synchronous. Inside the batch, the Transformer's own
     * x(), y(), width(), height() and getClientRect() are computed on read; its anchors are laid out
     * when the batch finishes, or earlier if something draws or measures them.
     * Change events fire inside the batch, so a listener sees the new attributes and the
     * Transformer's box, but not its anchors; call transformer.update() there if it needs them.
     * Batches nest. Call the returned function in a finally block, and do not keep a batch
     * open across an await or an animation frame.
     * @method
     * @name Konva.beginUpdateBatch
     * @returns {Function} finishes the batch and runs the pending updates
     * @example
     * const finish = Konva.beginUpdateBatch();
     * try {
     *   selectedNodes.forEach((node) => node.width(100));
     * } finally {
     *   finish();
     * }
     */
    beginUpdateBatch: Node._beginUpdateBatch,
    Util,
    Transform,
    Node,
    Container,
    Stage,
    stages,
    Layer,
    FastLayer,
    Group,
    DD,
    Shape,
    shapes,
    Animation,
    Tween,
    Easings,
    Context,
    Canvas,
});
export default Konva;
