import { Layer } from './Layer.ts';
/**
 * FastLayer constructor. **DEPRECATED!** Please use `Konva.Layer({ listening: false})` instead. Layers are tied to their own canvas element and are used
 * to contain shapes only.  If you don't need node nesting, mouse and touch interactions,
 * or event pub/sub, you should use FastLayer instead of Layer to create your layers.
 * It renders about 2x faster than normal layers.
 *
 * @constructor
 * @memberof Konva
 * @augments Konva.Layer
 @@containerParams
 * @example
 * var layer = new Konva.FastLayer();
 */
export declare class FastLayer extends Layer {
    constructor(attrs?: any);
}
