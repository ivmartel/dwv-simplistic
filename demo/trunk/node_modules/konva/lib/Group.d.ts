import type { ContainerConfig } from './Container.ts';
import { Container } from './Container.ts';
import type { Node } from './Node.ts';
import type { Shape } from './Shape.ts';
import type { SceneCanvas } from './Canvas.ts';
import type { GetSet } from './types.ts';
export interface GroupConfig extends ContainerConfig {
    isolated?: boolean;
}
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
export declare class Group extends Container<Group | Shape, GroupConfig> {
    _validateAdd(child: Node): void;
    _drawChildNodes(drawMethod: any, canvas: SceneCanvas, top?: Node): void;
    isolated: GetSet<boolean, this>;
}
