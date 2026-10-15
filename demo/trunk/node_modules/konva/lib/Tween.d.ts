import { Animation } from './Animation.ts';
import type { NodeConfig } from './Node.ts';
import { Node } from './Node.ts';
declare class TweenEngine {
    prop: string;
    propFunc: Function;
    begin: number;
    _pos: number;
    duration: number;
    prevPos: number;
    yoyo: boolean;
    _time: number;
    _position: number;
    _startTime: number;
    _finish: number;
    func: Function;
    _change: number;
    state: number;
    onPlay: Function;
    onReverse: Function;
    onPause: Function;
    onReset: Function;
    onFinish: Function;
    onUpdate: Function;
    constructor(prop: any, propFunc: any, func: any, begin: any, finish: any, duration: any, yoyo: any);
    fire(str: any): void;
    setTime(t: any): void;
    getTime(): number;
    setPosition(p: any): void;
    getPosition(t: any): any;
    play(): void;
    reverse(): void;
    seek(t: any): void;
    reset(): void;
    finish(): void;
    update(): void;
    onEnterFrame(): void;
    pause(): void;
    getTimer(): number;
}
export interface TweenOwnConfig {
    node: Node;
    duration?: number;
    easing?: (typeof Easings)[keyof typeof Easings];
    yoyo?: boolean;
    onFinish?: Function;
    onUpdate?: Function;
    onReset?: Function;
}
export interface TweenConfig extends NodeConfig, TweenOwnConfig {
}
/**
 * Tween constructor.  Tweens enable you to animate a node between the current state and a new state.
 *  You can play, pause, reverse, seek, reset, and finish tweens.  By default, tweens are animated using
 *  a linear easing.  For more tweening options, check out {@link Konva.Easings}
 * @constructor
 * @memberof Konva
 * @example
 * // instantiate new tween which fully rotates a node in 1 second
 * var tween = new Konva.Tween({
 *   // list of tween specific properties
 *   node: node,
 *   duration: 1,
 *   easing: Konva.Easings.EaseInOut,
 *   yoyo: false, // play back and forth
 *   onUpdate: () => console.log('node attrs updated'),
 *   onFinish: () => console.log('finished'),
 *   // set new values for any attributes of a passed node
 *   rotation: 360,
 *   fill: 'red'
 * });
 *
 * // play tween
 * tween.play();
 *
 * // pause tween
 * tween.pause();
 */
export declare class Tween {
    static attrs: {};
    static tweens: {};
    node: Node;
    anim: Animation;
    tween: TweenEngine;
    _id: number;
    onFinish: Function | undefined;
    onReset: Function | undefined;
    onUpdate: Function | undefined;
    constructor(config: TweenConfig);
    _addAttr(key: any, end: any): void;
    _tweenFunc(i: any): void;
    _addListeners(): void;
    /**
     * play
     * @method
     * @name Konva.Tween#play
     * @returns {Tween}
     */
    play(): this;
    /**
     * reverse
     * @method
     * @name Konva.Tween#reverse
     * @returns {Tween}
     */
    reverse(): this;
    /**
     * reset
     * @method
     * @name Konva.Tween#reset
     * @returns {Tween}
     */
    reset(): this;
    /**
     * seek
     * @method
     * @name Konva.Tween#seek
     * @param {Number} t time in seconds between 0 and the duration
     * @returns {Tween}
     */
    seek(t: any): this;
    /**
     * pause
     * @method
     * @name Konva.Tween#pause
     * @returns {Tween}
     */
    pause(): this;
    /**
     * finish
     * @method
     * @name Konva.Tween#finish
     * @returns {Tween}
     */
    finish(): this;
    /**
     * destroy
     * @method
     * @name Konva.Tween#destroy
     */
    destroy(): void;
}
/**
 * @namespace Easings
 * @memberof Konva
 */
export declare const Easings: {
    /**
     * back ease in
     * @function
     * @memberof Konva.Easings
     */
    BackEaseIn(t: any, b: any, c: any, d: any): any;
    /**
     * back ease out
     * @function
     * @memberof Konva.Easings
     */
    BackEaseOut(t: any, b: any, c: any, d: any): any;
    /**
     * back ease in out
     * @function
     * @memberof Konva.Easings
     */
    BackEaseInOut(t: any, b: any, c: any, d: any): any;
    /**
     * elastic ease in
     * @function
     * @memberof Konva.Easings
     */
    ElasticEaseIn(t: any, b: any, c: any, d: any, a: any, p: any): any;
    /**
     * elastic ease out
     * @function
     * @memberof Konva.Easings
     */
    ElasticEaseOut(t: any, b: any, c: any, d: any, a: any, p: any): any;
    /**
     * elastic ease in out
     * @function
     * @memberof Konva.Easings
     */
    ElasticEaseInOut(t: any, b: any, c: any, d: any, a: any, p: any): any;
    /**
     * bounce ease out
     * @function
     * @memberof Konva.Easings
     */
    BounceEaseOut(t: any, b: any, c: any, d: any): any;
    /**
     * bounce ease in
     * @function
     * @memberof Konva.Easings
     */
    BounceEaseIn(t: any, b: any, c: any, d: any): any;
    /**
     * bounce ease in out
     * @function
     * @memberof Konva.Easings
     */
    BounceEaseInOut(t: any, b: any, c: any, d: any): any;
    /**
     * ease in
     * @function
     * @memberof Konva.Easings
     */
    EaseIn(t: any, b: any, c: any, d: any): any;
    /**
     * ease out
     * @function
     * @memberof Konva.Easings
     */
    EaseOut(t: any, b: any, c: any, d: any): any;
    /**
     * ease in out
     * @function
     * @memberof Konva.Easings
     */
    EaseInOut(t: any, b: any, c: any, d: any): any;
    /**
     * strong ease in
     * @function
     * @memberof Konva.Easings
     */
    StrongEaseIn(t: any, b: any, c: any, d: any): any;
    /**
     * strong ease out
     * @function
     * @memberof Konva.Easings
     */
    StrongEaseOut(t: any, b: any, c: any, d: any): any;
    /**
     * strong ease in out
     * @function
     * @memberof Konva.Easings
     */
    StrongEaseInOut(t: any, b: any, c: any, d: any): any;
    /**
     * linear
     * @function
     * @memberof Konva.Easings
     */
    Linear(t: any, b: any, c: any, d: any): any;
};
export {};
