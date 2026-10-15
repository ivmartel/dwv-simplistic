import { Util } from "./Util.js";
import { getComponentValidator } from "./Validators.js";
const GET = 'get';
const SET = 'set';
export const Factory = {
    addGetterSetter(constructor, attr, def, validator, after) {
        Factory.addGetter(constructor, attr, def);
        Factory.addSetter(constructor, attr, validator, after);
        Factory.addOverloadedGetterSetter(constructor, attr);
    },
    addGetter(constructor, attr, def) {
        const method = GET + Util._capitalize(attr);
        // array defaults are shared between instances, so hand out a copy
        const isArr = Array.isArray(def);
        const getter = function () {
            const val = this.attrs[attr];
            return val === undefined ? (isArr ? def.slice() : def) : val;
        };
        // toObject() compares an attr with the default of the generated getter
        getter._def = def;
        constructor.prototype[method] = constructor.prototype[method] || getter;
    },
    addSetter(constructor, attr, validator, after) {
        const method = SET + Util._capitalize(attr);
        if (!constructor.prototype[method]) {
            Factory.overWriteSetter(constructor, attr, validator, after);
        }
    },
    overWriteSetter(constructor, attr, validator, after) {
        const method = SET + Util._capitalize(attr);
        constructor.prototype[method] = function (val) {
            if (validator && val !== undefined && val !== null) {
                val = validator.call(this, val, attr);
            }
            this._setAttr(attr, val);
            if (after) {
                after.call(this);
            }
            return this;
        };
    },
    addComponentsGetterSetter(constructor, attr, components, validator, after) {
        const len = components.length, capitalize = Util._capitalize, getter = GET + capitalize(attr), setter = SET + capitalize(attr), keys = components.map((c) => attr + capitalize(c)), 
        // built-in components have their own getters, e.g. getOffsetX
        getters = keys.map((key) => GET + capitalize(key));
        // getter
        constructor.prototype[getter] = function () {
            const ret = {};
            for (let n = 0; n < len; n++) {
                const get = this[getters[n]];
                ret[components[n]] = get ? get.call(this) : this.attrs[keys[n]];
            }
            return ret;
        };
        const basicValidator = getComponentValidator(components);
        // setter
        constructor.prototype[setter] = function (val) {
            const oldVal = this[getter]();
            if (validator) {
                val = validator.call(this, val, attr);
            }
            if (basicValidator) {
                basicValidator.call(this, val, attr);
            }
            for (const key in val) {
                if (!val.hasOwnProperty(key)) {
                    continue;
                }
                this._setAttr(attr + capitalize(key), val[key]);
            }
            if (!val) {
                components.forEach((component) => {
                    this._setAttr(attr + capitalize(component), undefined);
                });
            }
            this._fireChangeEvent(attr, oldVal, val);
            if (after) {
                after.call(this);
            }
            return this;
        };
        Factory.addOverloadedGetterSetter(constructor, attr);
    },
    addOverloadedGetterSetter(constructor, attr) {
        const capitalizedAttr = Util._capitalize(attr), setter = SET + capitalizedAttr, getter = GET + capitalizedAttr;
        const accessor = function () {
            // setting
            if (arguments.length) {
                this[setter](arguments[0]);
                return this;
            }
            // getting
            return this[getter]();
        };
        constructor.prototype[attr] = accessor;
    },
    backCompat(constructor, methods) {
        Util.each(methods, function (oldMethodName, newMethodName) {
            const method = constructor.prototype[newMethodName];
            const oldGetter = GET + Util._capitalize(oldMethodName);
            const oldSetter = SET + Util._capitalize(oldMethodName);
            function deprecated() {
                Util.error('"' +
                    oldMethodName +
                    '" method is deprecated and will be removed soon. Use ""' +
                    newMethodName +
                    '" instead.');
                return method.apply(this, arguments);
            }
            constructor.prototype[oldMethodName] = deprecated;
            constructor.prototype[oldGetter] = deprecated;
            constructor.prototype[oldSetter] = deprecated;
        });
    },
    afterSetFilter() {
        this._filterUpToDate = false;
    },
};
