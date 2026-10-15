import { Util } from "./Util.js";
import { Container } from "./Container.js";
import { _registerNode } from "./Global.js";
import { Factory } from "./Factory.js";
import { getBooleanValidator } from "./Validators.js";
/**
 * Group constructor.  Groups are used to contain shapes or other groups.
 * @constructor
 * @memberof Konva
 * @augments Konva.Container
 * @param {Object} config
 * @param {Boolean} [config.isolated=false] composite children as one live image
 * @@nodeParams
 * @@containerParams
 * @example
 * var group = new Konva.Group();
 */
export class Group extends Container {
    _validateAdd(child) {
        const type = child.getType();
        if (type !== 'Group' && type !== 'Shape') {
            Util.throw('You may only add groups and shapes to groups.');
        }
    }
    _drawChildNodes(drawMethod, canvas, top) {
        // cache() already provides an isolated surface and owns its snapshot.
        if (drawMethod !== 'drawScene' || !this.isolated() || top === this) {
            return super._drawChildNodes(drawMethod, canvas, top);
        }
        if (!canvas.width || !canvas.height) {
            return;
        }
        const context = canvas.getContext();
        const surface = canvas._prepareIsolationCanvas(this.getClientRect({ _forDrawing: true, relativeTo: top }));
        const surfaceContext = surface.getContext();
        surfaceContext._opacityRoot = this;
        context.save();
        try {
            super._drawChildNodes(drawMethod, surface, top);
            context._applyOpacity(this);
            context._drawDeviceBuffer(surface);
        }
        catch (error) {
            // A throwing sceneFunc can leave unbalanced saves or a clip on the
            // scratch context. Discard it rather than contaminate the next draw.
            canvas._releaseIsolationCanvas();
            throw error;
        }
        finally {
            context.restore();
            surfaceContext._opacityRoot = undefined;
        }
    }
}
/**
 * Get or set group isolation. Default is false.
 * An isolated group draws its children into a transparent canvas on each scene draw.
 * The group opacity and globalCompositeOperation apply once to the completed image.
 * Child blend modes and erasing affect only the content inside that canvas.
 *
 * Explicit cache() calls keep their snapshot behavior. clearCache() resumes live drawing.
 * Hit testing keeps its normal behavior, including hits on erased content.
 * For video or canvas sources, schedule draws when the source changes.
 *
 * Buffers use conservative content bounds at the destination pixel ratio.
 * Moving the buffer origin changes native edge coverage. A few edge pixels
 * can differ substantially; isolation does not promise pixel-identical antialiasing.
 * Like cache(), isolation requires custom drawing (sceneFunc, charRenderFunc) to provide accurate
 * bounds, including any pixels it paints outside its size: selfRectFunc or a
 * getSelfRect() override.
 * Text is bounded by its lines plus one font size, so a glyph with many stacked
 * marks can be clipped. node-canvas shadows can change with bitmap origin.
 * Siblings reuse a buffer; unused or oversized buffers are freed after each layer draw.
 * @name Konva.Group#isolated
 * @method
 * @param {Boolean} isolated
 * @returns {Boolean}
 * @example
 * const group = new Konva.Group({ isolated: true, opacity: 0.5 });
 * group.add(shape1, shape2);
 * group.isolated(false);
 */
Factory.addGetterSetter(Group, 'isolated', false, getBooleanValidator());
Group.prototype.nodeType = 'Group';
_registerNode(Group);
