var _a;
var _b;
import { Konva } from "./_CoreInternals.js";
// @ts-ignore
import * as Canvas from 'canvas';
const canvas = Canvas['default'] || Canvas;
// @ts-ignore
global.DOMMatrix = canvas.DOMMatrix;
// @ts-ignore
(_a = (_b = global).Path2D) !== null && _a !== void 0 ? _a : (_b.Path2D = class Path2D {
    constructor(path) {
        this.path = path;
    }
    get [Symbol.toStringTag]() {
        return `Path2D`;
    }
});
Konva.Util['createCanvasElement'] = () => {
    const node = canvas.createCanvas(300, 300);
    if (!node['style']) {
        node['style'] = {};
    }
    return node;
};
// create image in Node env
Konva.Util.createImageElement = () => {
    const node = new canvas.Image();
    return node;
};
Konva._renderBackend = 'node-canvas';
// the core Konva object, without shapes and filters. `import 'konva'` extends
// this same object with them
export default Konva;
