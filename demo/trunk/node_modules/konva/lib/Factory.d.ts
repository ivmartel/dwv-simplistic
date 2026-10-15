import type { Node } from './Node.ts';
import type { GetSet } from './types.ts';
/**
 * Enforces that a type is a string.
 */
type EnforceString<T> = T extends string ? T : never;
/**
 * Represents a class.
 */
type Constructor = abstract new (...args: any) => any;
/**
 * An attribute of an instance of the provided class. Attributes names be strings.
 */
type Attr<T extends Constructor> = EnforceString<keyof InstanceType<T>>;
/**
 * A function that is called after a setter is called.
 */
type AfterFunc<T extends Constructor> = (this: InstanceType<T>) => void;
/**
 * Extracts the type a GetSet returns. The type the setter accepts can be wider,
 * so it is matched with `any` instead of being inferred from the getter.
 */
type ExtractGetSet<T> = T extends GetSet<infer U, any, any> ? U : never;
/**
 * Extracts the type of a GetSet class attribute.
 */
type Value<T extends Constructor, U extends Attr<T>> = ExtractGetSet<InstanceType<T>[U]>;
/**
 * A function that validates a value.
 */
type ValidatorFunc<T> = (val: T, attr: string) => T;
/**
 * Extracts the "components" (keys) of a GetSet value. The value must be an object.
 */
type ExtractComponents<T extends Constructor, U extends Attr<T>> = Value<T, U> extends Record<string, any> ? EnforceString<keyof Value<T, U>>[] : never;
export declare const Factory: {
    addGetterSetter<T extends Constructor, U extends Attr<T>>(constructor: T, attr: U, def?: Value<T, U>, validator?: ValidatorFunc<Value<T, U>>, after?: AfterFunc<T>): void;
    addGetter<T extends Constructor, U extends Attr<T>>(constructor: T, attr: U, def?: Value<T, U>): void;
    addSetter<T extends Constructor, U extends Attr<T>>(constructor: T, attr: U, validator?: ValidatorFunc<Value<T, U>>, after?: AfterFunc<T>): void;
    overWriteSetter<T extends Constructor, U extends Attr<T>>(constructor: T, attr: U, validator?: ValidatorFunc<Value<T, U>>, after?: AfterFunc<T>): void;
    addComponentsGetterSetter<T extends Constructor, U extends Attr<T>>(constructor: T, attr: U, components: ExtractComponents<T, U>, validator?: ValidatorFunc<Value<T, U>>, after?: AfterFunc<T>): void;
    addOverloadedGetterSetter<T extends Constructor, U extends Attr<T>>(constructor: T, attr: U): void;
    backCompat<T extends Constructor>(constructor: T, methods: Record<string, string>): void;
    afterSetFilter(this: Node): void;
};
export {};
